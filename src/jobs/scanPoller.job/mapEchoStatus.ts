import { ScanStatus } from "@prisma/client";

export function mapEchoStatus(status: string): ScanStatus {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case ScanStatus.PENDING:
      return ScanStatus.PENDING;
    case ScanStatus.RUNNING:
      return ScanStatus.RUNNING;
    case ScanStatus.COMPLETED:
      return ScanStatus.COMPLETED;
    case ScanStatus.FAILED:
      return ScanStatus.FAILED;
    case ScanStatus.CANCELLED:
      return ScanStatus.CANCELLED;
    case ScanStatus.EXPIRED:
      return ScanStatus.EXPIRED;
    default:
      return ScanStatus.RUNNING;
  }
}