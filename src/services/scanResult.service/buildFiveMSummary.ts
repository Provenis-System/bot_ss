import type { EchoScanDetailsResponse } from "../../types/scan.js";

import { collectSignals } from "./collectSignals.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

export function buildFiveMSummary(scan: EchoScanDetailsResponse): string {
  const detection = formatDetectionLabel(scan.detection ?? scan.result);
  const accountCount = scan.accounts?.length ?? 0;
  const indicationNames =
    scan.indications
      ?.filter((indication) => (indication.level ?? 0) >= 1)
      .slice(0, 3)
      .map((indication) => indication.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];
  const signals = indicationNames.length > 0 ? indicationNames : collectSignals(scan.results, "", 3);
  const suffix = signals.length > 0 ? ` | sinais: ${signals.join(" | ")}` : "";

  return `FiveM ${detection} | contas: ${accountCount} | ban: ${scan.marked ? "sim" : "não"}${suffix}`;
}