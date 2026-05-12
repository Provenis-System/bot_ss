import type { EchoScanDetailsResponse } from "../../types/scan.js";

import { echoRequest } from "./http.js";

export async function getEchoScanDetails(scanId: string): Promise<EchoScanDetailsResponse> {
  return echoRequest<EchoScanDetailsResponse>(`/v1/scan/${scanId}`, {
    method: "GET"
  });
}