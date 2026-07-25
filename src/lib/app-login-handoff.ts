export type AppHandoffState =
  | "idle"
  | "creating"
  | "waiting"
  | "success"
  | "expired"
  | "superseded"
  | "timeout"
  | "error";

type AppLoginStatus = "pending" | "exchanged" | "expired" | "superseded";

interface AppLoginApi {
  create(): Promise<{ token: string; expires_in: number }>;
  status(token: string): Promise<{ status: AppLoginStatus }>;
}

interface HandoffDependencies {
  api: AppLoginApi;
  desktop: boolean;
  navigate(url: string): void;
  onState(state: AppHandoffState): void;
  onFallbacks(visible: boolean): void;
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => number;
  clearTimer?: (id: number) => void;
  pollMs?: number;
  fallbackMs?: number;
}

export function appScheme(desktop: boolean): "cheezyvpn" | "cheezy" {
  return desktop ? "cheezyvpn" : "cheezy";
}

export class AppLoginHandoff {
  private state: AppHandoffState = "idle";
  private active: { token: string; expiresAt: number } | null = null;
  private creating = false;
  private disposed = false;
  private pollTimer: number | null = null;
  private fallbackTimer: number | null = null;
  private readonly now: () => number;
  private readonly setTimer: (callback: () => void, delay: number) => number;
  private readonly clearTimer: (id: number) => void;
  private readonly pollMs: number;
  private readonly fallbackMs: number;

  constructor(private readonly deps: HandoffDependencies) {
    this.now = deps.now ?? Date.now;
    this.setTimer =
      deps.setTimer ??
      ((callback, delay) => window.setTimeout(callback, delay));
    this.clearTimer = deps.clearTimer ?? ((id) => window.clearTimeout(id));
    this.pollMs = deps.pollMs ?? 1_500;
    this.fallbackMs = deps.fallbackMs ?? 5_000;
  }

  async start(): Promise<void> {
    if (this.creating || this.state === "waiting") return;
    this.creating = true;
    this.active = null;
    this.clearTimers();
    this.deps.onFallbacks(false);
    this.emit("creating");
    try {
      const { token, expires_in } = await this.deps.api.create();
      if (this.disposed) return;
      const expiresAt = this.now() + expires_in * 1_000;
      this.active = { token, expiresAt };
      this.emit("waiting");
      this.fallbackTimer = this.setTimer(
        () => this.deps.onFallbacks(true),
        this.fallbackMs,
      );
      this.schedulePoll(token, expiresAt);
      this.deps.navigate(
        `${appScheme(this.deps.desktop)}://login/${encodeURIComponent(token)}`,
      );
    } catch {
      if (!this.disposed) this.finish("error");
    } finally {
      this.creating = false;
    }
  }

  openLegacy(): boolean {
    if (!this.active || this.now() >= this.active.expiresAt) {
      this.finish("expired");
      return false;
    }
    this.deps.navigate(
      `cheezy://login/${encodeURIComponent(this.active.token)}`,
    );
    return true;
  }

  canOpenLegacy(): boolean {
    return Boolean(this.active && this.now() < this.active.expiresAt);
  }

  dispose(): void {
    this.disposed = true;
    this.clearTimers();
  }

  private emit(state: AppHandoffState): void {
    this.state = state;
    this.deps.onState(state);
  }

  private finish(state: AppHandoffState): void {
    this.clearTimers();
    this.emit(state);
    this.deps.onFallbacks(state !== "success");
  }

  private schedulePoll(token: string, expiresAt: number): void {
    if (this.disposed) return;
    this.pollTimer = this.setTimer(() => {
      void this.poll(token, expiresAt);
    }, this.pollMs);
  }

  private async poll(token: string, expiresAt: number): Promise<void> {
    if (this.now() >= expiresAt) {
      this.finish("timeout");
      return;
    }
    try {
      const result = await this.deps.api.status(token);
      if (this.disposed) return;
      if (result.status === "exchanged") {
        this.finish("success");
        return;
      }
      if (result.status === "expired" || result.status === "superseded") {
        this.finish(result.status);
        return;
      }
    } catch {
      if (this.disposed) return;
      if (this.now() >= expiresAt) {
        this.finish("error");
        return;
      }
    }
    this.schedulePoll(token, expiresAt);
  }

  private clearTimers(): void {
    if (this.pollTimer !== null) {
      this.clearTimer(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.fallbackTimer !== null) {
      this.clearTimer(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}
