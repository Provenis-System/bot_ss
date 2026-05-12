import type { EchoScanLookupItem } from "../../types/scan.js";

import { echoRequest } from "./http.js";

export async function getEchoScansByPin(pin: string): Promise<EchoScanLookupItem[]> {
  return (await echoRequest<EchoScanLookupItem[] | null>(`/v1/scan/${pin}`, {
    method: "GET"
  })) ?? [];
}