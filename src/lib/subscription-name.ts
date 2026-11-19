import type { ManagedSubscription } from "../api/client";

export function subscriptionName(sub: ManagedSubscription, subscriptions: ManagedSubscription[]) {
  const name = sub.label?.trim() || sub.tariff;
  const shared = subscriptions.some(other =>
    other.id !== sub.id && (other.label?.trim() || other.tariff) === name
  );
  return shared ? `${name} #${sub.id}` : name;
}
