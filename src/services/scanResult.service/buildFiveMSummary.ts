import type { EchoScanDetailsResponse } from "../../types/scan.js";

import { collectSignals } from "./collectSignals.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickTopSignals(scan: EchoScanDetailsResponse): string[] {
  const results = isRecord(scan.results) ? scan.results : null;
  const traces = Array.isArray(results?.traces) ? results.traces : [];
  const custom = Array.isArray(results?.custom) ? results.custom : [];

  const traceNames = traces
    .map((entry) => (isRecord(entry) && typeof entry.name === "string" ? entry.name.trim() : null))
    .filter((value): value is string => Boolean(value))
    .filter((value) => /cleaner|bypass|pastebin|anydesk|powershell|modder|flyside|midgard|sus files/i.test(value));

  const customSignals = custom
    .map((entry) => (isRecord(entry) && typeof entry.name === "string" ? entry.name.trim() : null))
    .filter((value): value is string => Boolean(value));

  const merged = [...traceNames, ...customSignals];
  return [...new Set(merged)].slice(0, 3);
}

export function buildFiveMSummary(scan: EchoScanDetailsResponse): string {
  const detection = formatDetectionLabel(scan.detection ?? scan.result);
  const accountCount = scan.accounts?.length ?? 0;
  const derivedSignals = pickTopSignals(scan);
  const signals = derivedSignals.length > 0 ? derivedSignals : collectSignals(scan.results, "", 3);
  const results = isRecord(scan.results) ? scan.results : null;
  const info = isRecord(results?.info) ? results.info : null;
  const vpn = typeof info?.vpn === "string" ? info.vpn : null;
  const suffix = signals.length > 0 ? ` | sinais: ${signals.join(" | ")}` : "";
  const vpnSuffix = vpn ? ` | vpn: ${vpn.toLowerCase() === "yes" ? "sim" : vpn.toLowerCase() === "no" ? "não" : vpn}` : "";

  return `FiveM ${detection} | contas: ${accountCount} | ban: ${scan.marked ? "sim" : "não"}${vpnSuffix}${suffix}`;
}