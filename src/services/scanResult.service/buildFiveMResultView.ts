import type { EchoScanDetailsResponse, EchoScanIndication, ScanResultView } from "../../types/scan.js";

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

function formatAccountLabel(rawType: string): string {
  const normalized = rawType.trim().toLowerCase();

  switch (normalized) {
    case "steam":
      return "Steam";
    case "license":
      return "License";
    case "license2":
      return "License 2";
    case "license3":
      return "License 3";
    case "license4":
      return "License 4";
    case "license5":
      return "License 5";
    case "discord":
      return "Discord";
    case "xbl":
      return "Xbox Live";
    case "live":
      return "Microsoft Live";
    case "fivem":
      return "FiveM";
    case "ip":
      return "IP";
    default:
      return rawType.trim();
  }
}

function formatAccountEntry(account: string, index: number): string {
  const trimmed = account.trim();

  if (!trimmed) {
    return `${index + 1}. Identificador vazio`;
  }

  const doubleColonParts = trimmed.split("::");
  if (doubleColonParts.length >= 2) {
    const [rawType, ...rest] = doubleColonParts;
    return `${index + 1}. ${formatAccountLabel(rawType)}: ${rest.join("::")}`;
  }

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex > 0) {
    const rawType = trimmed.slice(0, colonIndex);
    const rawValue = trimmed.slice(colonIndex + 1);
    return `${index + 1}. ${formatAccountLabel(rawType)}: ${rawValue}`;
  }

  return `${index + 1}. ${trimmed}`;
}

function formatAccounts(accounts?: string[] | null): string[] {
  if (!accounts || accounts.length === 0) {
    return ["Nenhum identificador retornado pela Echo."];
  }

  return accounts.slice(0, 8).map((account, index) => formatAccountEntry(account, index));
}

function formatIndication(indication: EchoScanIndication, index: number): string {
  const title = indication.name?.trim() || "Indicação sem nome";
  const fileName = indication.fileName?.trim();
  const tags = [indication.detectionSet, indication.detectionId].filter((value): value is string => Boolean(value && value.trim()));

  return `${index + 1}. ${title}${fileName ? ` | arquivo: ${fileName}` : ""}${tags.length > 0 ? ` | origem: ${tags.join("/")}` : ""}`;
}

function isPcaIndication(indication: EchoScanIndication): boolean {
  const title = indication.name?.toLowerCase() ?? "";
  const fileName = indication.fileName?.toLowerCase() ?? "";

  return (
    Boolean(fileName) ||
    /\[explorer\]|\[pca\]|arquivo|file|executed|executado|imgui|dll|exe|journal|history|defender entries/i.test(title)
  );
}

function isCheatTraceIndication(indication: EchoScanIndication): boolean {
  const title = indication.name?.toLowerCase() ?? "";

  return /cheat|bypass|loader|inject|spoofer|menu|project|tracks|synax|zimo|relikia|susano|ninja|hack|skript|redengine|midgard|imdisk|raccoon|otter|hyena/i.test(title);
}

function splitIndications(indications?: EchoScanIndication[] | null) {
  const grave = (indications ?? []).filter((indication) => (indication.level ?? 0) >= 2);
  const suspicious = (indications ?? []).filter((indication) => (indication.level ?? 0) === 1);
  const info = (indications ?? []).filter((indication) => (indication.level ?? 0) <= 0);

  const cheatTrace = [...grave, ...suspicious]
    .filter((indication, index, entries) => entries.indexOf(indication) === index)
    .filter((indication) => isCheatTraceIndication(indication));

  const pca = (indications ?? []).filter((indication) => isPcaIndication(indication));

  return { grave, suspicious, info, cheatTrace, pca };
}

function appendSection(lines: string[], title: string, items: string[], maxItems = 8) {
  lines.push(title);

  if (items.length === 0) {
    lines.push("Nenhum item nesta seção.");
    lines.push("");
    return;
  }

  lines.push(...items.slice(0, maxItems));
  if (items.length > maxItems) {
    lines.push(`... e mais ${items.length - maxItems} item(ns).`);
  }
  lines.push("");
}

function truncateLines(lines: string[], maxLength = 1800): string[] {
  const output: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    const nextLength = currentLength + line.length + 1;
    if (nextLength > maxLength) {
      output.push("... resposta resumida para caber no Discord.");
      break;
    }

    output.push(line);
    currentLength = nextLength;
  }

  return output;
}

export function buildFiveMResultView(scan: EchoScanDetailsResponse): ScanResultView {
  const detectionLabel = formatDetectionLabel(scan.detection ?? scan.result);
  const signals = collectSignals(scan.results);
  const accountLines = formatAccounts(scan.accounts);
  const sections = splitIndications(scan.indications);

  const lines = [
    "Informações do Scan:",
    `Jogo: ${scan.game ?? "FiveM / GTA-V RP"}`,
    `Resultado: ${detectionLabel}`,
    `Marcado para ban: ${formatBoolean(scan.marked)}`,
    `Scan público: ${formatBoolean(scan.public)}`,
    `Data do scan: ${formatDate(scan.time)}`,
    `PIN: ${scan.pin ?? "Indisponível"}`,
    "",
    "Identificadores / Contas:",
    ...accountLines,
    ""
  ];

  appendSection(lines, "Grave:", sections.grave.map(formatIndication), 10);
  appendSection(lines, "Suspeito:", sections.suspicious.map(formatIndication), 10);
  appendSection(lines, "Rastro de Cheat:", sections.cheatTrace.map(formatIndication), 8);
  appendSection(lines, "PCA:", sections.pca.map(formatIndication), 8);

  if (sections.info.length > 0 || signals.length > 0) {
    appendSection(
      lines,
      "Informativo:",
      [
        ...sections.info.map(formatIndication),
        ...signals.map((signal, index) => `${sections.info.length + index + 1}. ${signal}`)
      ],
      8
    );
  }

  return {
    title: `Resultado FiveM: ${detectionLabel}`,
    lines: truncateLines(lines)
  };
}