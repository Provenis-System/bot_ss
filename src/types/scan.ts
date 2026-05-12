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
  links?: {
    fivem?: string;
    [key: string]: string | undefined;
  } | null;
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