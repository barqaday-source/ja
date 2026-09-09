import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "jabilak.analytics.v1";
const MAX_EVENTS = 500;

export type AnalyticsEvent = {
  id: string;
  name: string;
  timestamp: string;
  properties: Record<string, string | number | boolean | null>;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeProperties(properties: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => !/(name|email|phone|message|token|password|address)/i.test(key))
      .map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
          return [key, value];
        }
        return [key, String(value)];
      }),
  ) as AnalyticsEvent["properties"];
}

export function createAnalyticsEvent(name: string, properties: Record<string, unknown> = {}): AnalyticsEvent {
  return {
    id: makeId(),
    name,
    timestamp: new Date().toISOString(),
    properties: sanitizeProperties(properties),
  };
}

export async function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  const event = createAnalyticsEvent(name, properties);
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, event].slice(-MAX_EVENTS)));
  } catch {
    // Analytics must never interrupt the user experience.
  }
  return event;
}

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function clearAnalyticsEvents() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function recordPerformance(name: string, durationMs: number, properties: Record<string, unknown> = {}) {
  return trackEvent("performance", { metric: name, durationMs: Math.round(durationMs), ...properties });
}

export function startPerformanceMark(name: string) {
  const startedAt = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
  return (properties: Record<string, unknown> = {}) => {
    const endedAt = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
    return recordPerformance(name, endedAt - startedAt, properties);
  };
}

export { STORAGE_KEY };
