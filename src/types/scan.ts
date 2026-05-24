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
  marked?: boolean | null;
  public?: boolean | null;
  time?: string | null;
};

export type EchoScanDetailsResponse = {
  uuid: string;
  pin?: string | null;
  game?: string | null;
  result?: string | null;
  marked?: boolean | null;
  public?: boolean | null;
  accounts?: string[] | null;
  time?: string | null;
  detection?: string | null;
  results?: unknown;
};

export type ScanResultSection = {
  label: string;
  items: string[];
  overflow: number;
};

export type ScanResultView = {
  title: string;
  detection: string;
  pin: string;
  hasGrave: boolean;
  hasSuspicious: boolean;
  info: string[];
  accounts: string[];
  accountOverflow: number;
  sections: ScanResultSection[];
  lines: string[];
};