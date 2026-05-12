import type { EchoScanDetailsResponse, ScanResultView } from "../../types/scan.js";

import { collectSignals } from "./collectSignals.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) {
    return "Sim";
  }

  if (value === false) {
    return "Não";
  }

  return "Indefinido";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Indisponível";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `<t:${Math.floor(parsed.getTime() / 1000)}:f>`;
}

function formatAccounts(accounts?: string[] | null): string[] {
  if (!accounts || accounts.length === 0) {
    return ["Nenhuma conta retornada pela Echo."];
  }

  return accounts.slice(0, 6).map((account, index) => `${index + 1}. ${account}`);
}

export function buildFiveMResultView(scan: EchoScanDetailsResponse): ScanResultView {
  const detectionLabel = formatDetectionLabel(scan.detection);
  const signals = collectSignals(scan.results);
  const accountLines = formatAccounts(scan.accounts);

  const lines = [
    `Jogo: ${scan.game ?? "FiveM / GTA-V RP"}`,
    `Detecção: ${detectionLabel}`,
    `Marcado para ban: ${formatBoolean(scan.marked)}`,
    `Scan público: ${formatBoolean(scan.public)}`,
    `Data do scan: ${formatDate(scan.time)}`,
    `PIN: ${scan.pin ?? "Indisponível"}`,
    "",
    "Contas encontradas:",
    ...accountLines,
    ""
  ];

  if (signals.length > 0) {
    lines.push("Sinais técnicos relevantes:");
    lines.push(...signals.map((signal, index) => `${index + 1}. ${signal}`));
  } else {
    lines.push("Sinais técnicos relevantes:");
    lines.push("Nenhum indicador textual relevante foi identificado no payload retornado.");
  }

  return {
    title: `Resultado FiveM: ${detectionLabel}`,
    lines
  };
}