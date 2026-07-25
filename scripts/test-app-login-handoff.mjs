import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const input = await readFile("src/lib/app-login-handoff.ts", "utf8");
const built = ts.transpileModule(input, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(built.outputText).toString("base64")}`;
const { AppLoginHandoff, appScheme } = await import(moduleUrl);

function harness(statuses = ["pending"]) {
  let now = 0;
  let nextTimer = 1;
  let creates = 0;
  const timers = new Map();
  const states = [];
  const fallbacks = [];
  const navigations = [];
  const queue = [...statuses];
  const handoff = new AppLoginHandoff({
    desktop: true,
    api: {
      create: async () => ({
        token: `one-time-token-${++creates}`,
        expires_in: 90,
      }),
      status: async () => ({ status: queue.shift() ?? "pending" }),
    },
    navigate: (url) => navigations.push(url),
    onState: (state) => states.push(state),
    onFallbacks: (visible) => fallbacks.push(visible),
    now: () => now,
    setTimer: (callback, delay) => {
      const id = nextTimer++;
      timers.set(id, { at: now + delay, callback });
      return id;
    },
    clearTimer: (id) => timers.delete(id),
  });

  async function advance(ms) {
    const end = now + ms;
    while (true) {
      const due = [...timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].callback();
      await Promise.resolve();
      await Promise.resolve();
    }
    now = end;
  }

  return {
    handoff,
    states,
    fallbacks,
    navigations,
    advance,
    creates: () => creates,
  };
}

assert.equal(appScheme(true), "cheezyvpn");
assert.equal(appScheme(false), "cheezy");

{
  const h = harness(["exchanged"]);
  await h.handoff.start();
  assert.deepEqual(h.states, ["creating", "waiting"]);
  assert.equal(h.navigations[0], "cheezyvpn://login/one-time-token-1");
  await h.advance(1_500);
  assert.equal(h.states.at(-1), "success");
  assert.equal(h.fallbacks.at(-1), false);
}

{
  const h = harness(["pending", "expired"]);
  await h.handoff.start();
  await h.advance(5_000);
  assert.equal(h.fallbacks.at(-1), true);
  await h.advance(1_000);
  assert.equal(h.states.at(-1), "expired");
}

{
  const h = harness(["superseded"]);
  await h.handoff.start();
  await h.advance(1_500);
  assert.equal(h.states.at(-1), "superseded");
  await h.handoff.start();
  assert.equal(h.creates(), 2);
}

{
  const h = harness();
  await h.handoff.start();
  await h.handoff.start();
  assert.equal(h.creates(), 1);
  assert.equal(h.handoff.openLegacy(), true);
  assert.equal(h.navigations.at(-1), "cheezy://login/one-time-token-1");
}

{
  const h = harness();
  await h.handoff.start();
  await h.advance(90_000);
  assert.equal(h.states.at(-1), "timeout");
}

console.log("app-login handoff tests passed");
