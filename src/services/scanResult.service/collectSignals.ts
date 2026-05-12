import { isRecord } from "./isRecord.js";

const INTERESTING_KEY_PATTERN =
  /(cheat|mod|menu|inject|executor|spoofer|flag|detect|suspicious|ban|blacklist|steam|license|license2|license3|license4|license5|discord|citizen|rockstar|xbl|live|ip|hwid|serial)/i;

function stringifySignalValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => stringifySignalValue(entry))
      .filter((entry): entry is string => Boolean(entry));

    return parts.length > 0 ? parts.join(", ") : null;
  }

  return null;
}

export function collectSignals(value: unknown, prefix = "", maxItems = 8): string[] {
  const signals: string[] = [];

  const walk = (current: unknown, path: string) => {
    if (signals.length >= maxItems) {
      return;
    }

    if (Array.isArray(current)) {
      const printable = stringifySignalValue(current);
      if (printable && INTERESTING_KEY_PATTERN.test(path)) {
        signals.push(`${path}: ${printable}`);
        return;
      }

      current.forEach((entry, index) => {
        walk(entry, path ? `${path}[${index}]` : `[${index}]`);
      });
      return;
    }

    if (isRecord(current)) {
      for (const [key, entry] of Object.entries(current)) {
        if (signals.length >= maxItems) {
          return;
        }

        const nextPath = path ? `${path}.${key}` : key;
        if (!isRecord(entry) && !Array.isArray(entry)) {
          const printable = stringifySignalValue(entry);
          if (printable && INTERESTING_KEY_PATTERN.test(nextPath)) {
            signals.push(`${nextPath}: ${printable}`);
            continue;
          }
        }

        walk(entry, nextPath);
      }
    }
  };

  walk(value, prefix);
  return signals;
}