import type { EchoScanDetailsResponse } from "../../types/scan.js";

import { collectSignals } from "./collectSignals.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

export function buildFiveMSummary(scan: EchoScanDetailsResponse): string {
  const detection = formatDetectionLabel(scan.detection);
  const accountCount = scan.accounts?.length ?? 0;
  const signals = collectSignals(scan.results, "", 3);
  const suffix = signals.length > 0 ? ` | sinais: ${signals.join(" | ")}` : "";

  return `FiveM ${detection} | contas: ${accountCount} | ban: ${scan.marked ? "sim" : "não"}${suffix}`;
}