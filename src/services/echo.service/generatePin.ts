import type { EchoPinResponse } from "../../types/scan.js";

import { echoRequest } from "./http.js";

export async function generateEchoPin(): Promise<EchoPinResponse> {
  return echoRequest<EchoPinResponse>("/v1/user/pin", {
    method: "GET"
  });
}