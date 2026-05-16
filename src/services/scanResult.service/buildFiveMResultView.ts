import type { EchoScanDetailsResponse, EchoScanIndication, ScanResultView } from "../../types/scan.js";

import { collectSignals } from "./collectSignals.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

type TraceEntry = {
  name: string;
  source: string | undefined;
  severity: "grave" | "suspeito" | "info";
};

type CustomEntry = {
  name: string;
  severity: "grave" | "suspeito" | "info";
  indicationNames: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function formatUnixDate(value?: number | null): string {
  if (!value || value <= 0) {
    return "Indisponível";
  }

  return `<t:${Math.floor(value)}:f>`;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function classifySeverity(text: string): "grave" | "suspeito" | "info" {
  const normalized = text.toLowerCase();

  if (/cheat|bypass|inject|spoofer|cleaner|limpeza de logs|powershell history has been modified|sus files|modder|loader|hack/i.test(normalized)) {
    return "grave";
  }

  if (/warning|pastebin|anydesk|flyside|midgard|vpn|unusual|using [a-z]|fivem executado/i.test(normalized)) {
    return "suspeito";
  }

  return "info";
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

function formatBullet(item: string, index: number): string {
  return `${index + 1}. ${item}`;
}

function extractTraceEntries(scan: EchoScanDetailsResponse): TraceEntry[] {
  const results = asObject(scan.results);
  const traces = asArray(results?.traces);

  const mapped = traces.map((entry): TraceEntry | null => {
      const record = asObject(entry);
      const name = asString(record?.name);
      if (!name) {
        return null;
      }

      const source = asString(record?.in_instance);
      const severity = classifySeverity(`${name} ${source ?? ""}`);
      return { name, source: source ?? undefined, severity };
    })
    .filter((entry): entry is TraceEntry => entry !== null);

  return mapped;
}

function extractCustomEntries(scan: EchoScanDetailsResponse): CustomEntry[] {
  const results = asObject(scan.results);
  const custom = asArray(results?.custom);

  return custom
    .map((entry) => {
      const record = asObject(entry);
      const name = asString(record?.name);
      if (!name) {
        return null;
      }

      const indications = asArray(record?.indications)
        .map((indication) => {
          const indicationRecord = asObject(indication);
          return asString(indicationRecord?.name);
        })
        .filter((value): value is string => Boolean(value));

      const severity = classifySeverity(`${name} ${indications.join(" ")}`);
      return { name, severity, indicationNames: indications } satisfies CustomEntry;
    })
    .filter((entry): entry is CustomEntry => Boolean(entry));
}

function extractInfoLines(scan: EchoScanDetailsResponse): string[] {
  const results = asObject(scan.results);
  const info = asObject(results?.info);
  const items: string[] = [];

  const os = asString(info?.os);
  const installationDate = asString(info?.installationDate);
  const recycleModified = asString(info?.recycleBinModified);

  if (os) {
    items.push(`Sistema: ${os}`);
  }

  if (installationDate) {
    items.push(`Instalação do Windows: ${formatDate(installationDate)}`);
  }

  if (recycleModified) {
    items.push(`Lixeira modificada: ${formatDate(recycleModified)}`);
  }

  return items;
}

function extractPcaLines(scan: EchoScanDetailsResponse): string[] {
  const results = asObject(scan.results);
  const rawPca = asString(results?.pca);
  if (!rawPca) {
    return [];
  }

  const processLines = rawPca
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",");
      return parts.length >= 6 ? parts[5] : null;
    })
    .filter((value): value is string => Boolean(value));

  const unique = [...new Set(processLines)];
  return unique.slice(0, 8).map((path, index) => `${index + 1}. ${path}`);
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
  const accountLines = formatAccounts(scan.accounts);
  const sections = splitIndications(scan.indications);
  const traceEntries = extractTraceEntries(scan);
  const customEntries = extractCustomEntries(scan);
  const infoLines = extractInfoLines(scan);
  const results = asObject(scan.results);
  const startTimes = asObject(results?.start_time);

  const lines = [
    "Informações do Scan:",
    `UUID: ${scan.uuid}`,
    `Marcado para ban: ${formatBoolean(scan.marked)}`,
    ...infoLines,
    `Início do PCA: ${formatUnixDate(asNumber(startTimes?.pca))}`,
    `Início do DNS: ${formatUnixDate(asNumber(startTimes?.dns))}`,
    "",
    "Identificadores / Contas:",
    ...accountLines,
    ""
  ];

  appendSection(
    lines,
    "Grave:",
    [
      ...sections.grave.map(formatIndication),
      ...traceEntries.filter((entry) => entry.severity === "grave").map((entry, index) => formatBullet(`${entry.name}${entry.source ? ` | origem: ${entry.source}` : ""}`, index)),
      ...customEntries.filter((entry) => entry.severity === "grave").map((entry, index) => formatBullet(`${entry.name}${entry.indicationNames.length > 0 ? ` | sinais: ${entry.indicationNames.join(", ")}` : ""}`, index))
    ],
    10
  );
  appendSection(
    lines,
    "Suspeito:",
    [
      ...sections.suspicious.map(formatIndication),
      ...traceEntries.filter((entry) => entry.severity === "suspeito").map((entry, index) => formatBullet(`${entry.name}${entry.source ? ` | origem: ${entry.source}` : ""}`, index)),
      ...customEntries.filter((entry) => entry.severity === "suspeito").map((entry, index) => formatBullet(`${entry.name}${entry.indicationNames.length > 0 ? ` | sinais: ${entry.indicationNames.join(", ")}` : ""}`, index))
    ],
    10
  );
  appendSection(
    lines,
    "Rastro de Cheat:",
    [
      ...sections.cheatTrace.map(formatIndication),
      ...traceEntries
        .filter((entry) => /cheat|bypass|cleaner|modder|pastebin|midgard|flyside|anydesk/i.test(`${entry.name} ${entry.source ?? ""}`))
        .map((entry, index) => formatBullet(`${entry.name}${entry.source ? ` | origem: ${entry.source}` : ""}`, index))
    ],
    8
  );

  lines.push(`Resultado FiveM: ${detectionLabel} | ${scan.pin ?? "sem pin"}`);

  return {
    title: `Resultado FiveM: ${detectionLabel} | ${scan.pin ?? "sem pin"}`,
    lines: truncateLines(lines)
  };
}