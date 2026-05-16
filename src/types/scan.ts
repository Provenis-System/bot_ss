import type { SupportedGameKey } from "./game.js";

export const SCAN_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED"
} as const;

export type ScanStatus = (typeof SCAN_STATUS)[keyof typeof SCAN_STATUS];

export type EchoPinResponse = {
  pin: string;
  links?: Partial<Record<SupportedGameKey, string>> | null;
};

export type EchoScanLookupItem = {
  uuid: string;
  game?: string | null;
  result?: string | null;
  indications?: EchoScanIndication[] | null;
  marked?: boolean | null;
  public?: boolean | null;
  time?: string | null;
};

export type EchoScanIndication = {
  name?: string | null;
  fileName?: string | null;
  level?: number | null;
  instance?: boolean | null;
  detectionId?: string | null;
  detectionSet?: string | null;
  echo?: boolean | null;
  customDetection?: boolean | null;
  customString?: boolean | null;
};

export type EchoScanDetailsResponse = {
  uuid: string;
  pin?: string | null;
  game?: string | null;
  result?: string | null;
  indications?: EchoScanIndication[] | null;
  marked?: boolean | null;
  public?: boolean | null;
  accounts?: string[] | null;
  time?: string | null;
  detection?: string | null;
  results?: unknown;
};

export type ScanResultView = {
  title: string;
  lines: string[];
};