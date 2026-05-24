import type { EchoScanDetailsResponse, ScanResultSection, ScanResultView } from "../../types/scan.js";
import { formatDetectionLabel } from "./formatDetectionLabel.js";

type TraceEntry = {
  name: string;
  source: string | undefined;
  severity: "grave" | "suspeito" | "info";
};

type GroupedTrace = {
  name: string;
  severity: "grave" | "suspeito" | "info";
  sources: string[];
};

type CustomEntry = {
  name: string;
  severity: "grave" | "suspeito" | "info";
  indicationNames: string[];
  notes: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return "Indefinido";
}

function formatDate(value?: string | null): string {
  if (!value) return "Indisponível";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `<t:${Math.floor(parsed.getTime() / 1000)}:f>`;
}

function formatUnixDate(value?: number | null): string {
  if (!value || value <= 0) return "Indisponível";
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

function echoTraceSeverity(inInstance?: string | null): "grave" | "suspeito" | "info" {
  const prefix = (inInstance ?? "").split(/[|:]/)[0].trim().toLowerCase();
  if (prefix === "severe") return "grave";
  if (prefix === "warning") return "suspeito";
  return "info";
}

function classifyCustomSeverity(name: string): "grave" | "suspeito" | "info" {
  const n = name.toLowerCase();
  if (/cheat|bypass|inject|spoofer|modder|loader|hack|fake extension|defender control|override/i.test(n)) {
    return "grave";
  }
  if (/cleaner|pastebin|anydesk|flyside|midgard|vpn|unusual|discord|website|download/i.test(n)) {
    return "suspeito";
  }
  return "info";
}

function extractMeaningfulNotes(raw: unknown): string[] {
  return asArray(raw)
    .map((n) => asString(n))
    .filter((line): line is string => {
      if (!line) return false;
      if (/^-{5,}/.test(line)) return false;
      if (/^Executing detection:/i.test(line)) return false;
      if (/^DETECTION\s+\|/i.test(line)) return false;
      if (/^\[System\]/i.test(line)) return false;
      return true;
    })
    .slice(0, 2);
}

function formatAccountLabel(rawType: string): string {
  switch (rawType.trim().toLowerCase()) {
    case "steam":    return "Steam";
    case "license":  return "License";
    case "license2": return "License 2";
    case "license3": return "License 3";
    case "license4": return "License 4";
    case "license5": return "License 5";
    case "discord":  return "Discord";
    case "xbl":      return "Xbox Live";
    case "live":     return "Microsoft Live";
    case "fivem":    return "FiveM";
    case "ip":       return "IP";
    default:         return rawType.trim();
  }
}

function formatAccountEntry(account: string, index: number): string {
  const trimmed = account.trim();
  if (!trimmed) return `${index + 1}. Identificador vazio`;

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

// Agrupa traces pelo nome e combina as origens
function groupTraceEntries(entries: TraceEntry[]): GroupedTrace[] {
  const map = new Map<string, GroupedTrace>();
  for (const e of entries) {
    const existing = map.get(e.name);
    if (existing) {
      if (e.source) existing.sources.push(e.source);
    } else {
      map.set(e.name, { name: e.name, severity: e.severity, sources: e.source ? [e.source] : [] });
    }
  }
  return [...map.values()];
}

function formatGroupedTrace(entry: GroupedTrace, index: number): string {
  const { name, sources } = entry;

  if (sources.length <= 1) {
    return `${index + 1}. ${name}${sources[0] ? ` | origem: ${sources[0]}` : ""}`;
  }

  // Extrai somente o nome do arquivo da origem "warning|file.exe"
  const files = sources
    .map((s) => s.split(/[|:]/)[1]?.trim())
    .filter((f): f is string => Boolean(f));

  if (files.length > 0) {
    const shown = files.slice(0, 3).join(", ");
    const extra = files.length > 3 ? ` +${files.length - 3}` : "";
    return `${index + 1}. ${name} (${files.length}x) — ${shown}${extra}`;
  }

  return `${index + 1}. ${name} (${sources.length}x)`;
}

function formatCustomEntry(entry: CustomEntry, index: number): string {
  const details = [...entry.indicationNames, ...entry.notes]
    .filter(Boolean)
    .slice(0, 2)
    .join(" | ");

  return `${index + 1}. ${entry.name}${details ? ` — ${details}` : ""}`;
}

function extractTraceEntries(scan: EchoScanDetailsResponse): TraceEntry[] {
  const results = asObject(scan.results);
  const traces = asArray(results?.traces);

  return traces
    .map((entry): TraceEntry | null => {
      const record = asObject(entry);
      const name = asString(record?.name);
      if (!name) return null;
      const source = asString(record?.in_instance);
      const severity = echoTraceSeverity(source);
      return { name, source: source ?? undefined, severity };
    })
    .filter((entry): entry is TraceEntry => entry !== null);
}

function extractCustomEntries(scan: EchoScanDetailsResponse): CustomEntry[] {
  const results = asObject(scan.results);
  const custom = asArray(results?.custom);

  return custom
    .map((entry): CustomEntry | null => {
      const record = asObject(entry);
      const name = asString(record?.name);
      if (!name) return null;

      const indicationNames = asArray(record?.indications)
        .map((indication) => asString(asObject(indication)?.name))
        .filter((value): value is string => Boolean(value));

      const notes = extractMeaningfulNotes(record?.notes);
      const severity = classifyCustomSeverity(name);
      return { name, severity, indicationNames, notes };
    })
    .filter((entry): entry is CustomEntry => entry !== null);
}

function extractInfoLines(scan: EchoScanDetailsResponse): string[] {
  const results = asObject(scan.results);
  const info = asObject(results?.info);
  const items: string[] = [];

  const os = asString(info?.os);
  const installationDate = asString(info?.installationDate);
  const recycleModified = asString(info?.recycleBinModified);

  if (os) items.push(`Sistema: ${os}`);
  if (installationDate) items.push(`Instalação do Windows: ${formatDate(installationDate)}`);
  if (recycleModified) items.push(`Lixeira modificada: ${formatDate(recycleModified)}`);

  return items;
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

function buildSection(label: string, items: string[], maxItems: number): ScanResultSection {
  const overflow = Math.max(0, items.length - maxItems);
  return { label, items: items.slice(0, maxItems), overflow };
}

export function buildFiveMResultView(scan: EchoScanDetailsResponse): ScanResultView {
  const detectionLabel = formatDetectionLabel(scan.detection ?? scan.result);
  const accountLines = formatAccounts(scan.accounts);
  const traceEntries = extractTraceEntries(scan);
  const customEntries = extractCustomEntries(scan);
  const infoLines = extractInfoLines(scan);
  const results = asObject(scan.results);
  const startTimes = asObject(results?.start_time);

  const infoSection = [
    `UUID: ${scan.uuid}`,
    `Marcado para ban: ${formatBoolean(scan.marked)}`,
    ...infoLines,
    `Início do PCA: ${formatUnixDate(asNumber(startTimes?.pca))}`,
    `Início do DNS: ${formatUnixDate(asNumber(startTimes?.dns))}`,
  ];

  const rawAccountCount = scan.accounts?.length ?? 0;
  const accountOverflow = Math.max(0, rawAccountCount - accountLines.length);

  // Agrupa traces pelo nome antes de formatar
  const groupedGraveTraces = groupTraceEntries(traceEntries.filter((e) => e.severity === "grave"));
  const groupedSuspiciousTraces = groupTraceEntries(traceEntries.filter((e) => e.severity === "suspeito"));

  const graveItems = [
    ...groupedGraveTraces.map((e, i) => formatGroupedTrace(e, i)),
    ...customEntries.filter((e) => e.severity === "grave").map((e, i) => formatCustomEntry(e, groupedGraveTraces.length + i)),
  ];

  const suspiciousItems = [
    ...groupedSuspiciousTraces.map((e, i) => formatGroupedTrace(e, i)),
    ...customEntries.filter((e) => e.severity === "suspeito").map((e, i) => formatCustomEntry(e, groupedSuspiciousTraces.length + i)),
  ];

  const cheatTraceItems = groupTraceEntries(
    traceEntries.filter(
      (e) => e.severity !== "info" && /cheat|bypass|cleaner|modder|pastebin|midgard|flyside|anydesk/i.test(`${e.name} ${e.source ?? ""}`)
    )
  ).map((e, i) => formatGroupedTrace(e, i));

  const structuredSections: ScanResultSection[] = [];
  if (graveItems.length > 0) structuredSections.push(buildSection("🔴 Grave", graveItems, 10));
  if (suspiciousItems.length > 0) structuredSections.push(buildSection("🟡 Suspeito", suspiciousItems, 10));
  if (cheatTraceItems.length > 0) structuredSections.push(buildSection("⚠️ Rastro de Cheat", cheatTraceItems, 8));

  const lines = [
    "Informações do Scan:",
    ...infoSection,
    "",
    "Identificadores / Contas:",
    ...accountLines,
    ""
  ];
  appendSection(lines, "Grave:", graveItems, 10);
  appendSection(lines, "Suspeito:", suspiciousItems, 10);
  appendSection(lines, "Rastro de Cheat:", cheatTraceItems, 8);
  lines.push(`Resultado FiveM: ${detectionLabel} | ${scan.pin ?? "sem pin"}`);

  return {
    title: `Resultado FiveM: ${detectionLabel} | ${scan.pin ?? "sem pin"}`,
    detection: detectionLabel,
    pin: scan.pin ?? "sem pin",
    hasGrave: graveItems.length > 0,
    hasSuspicious: suspiciousItems.length > 0,
    info: infoSection,
    accounts: accountLines,
    accountOverflow,
    sections: structuredSections,
    lines: truncateLines(lines)
  };
}
