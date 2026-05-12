import type { Client } from "discord.js";

import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { runPollCycle } from "./runPollCycle.js";

export function startScanPoller(client: Client<true>) {
  const intervalMs = env.SCAN_POLL_INTERVAL_SECONDS * 1000;

  const execute = async () => {
    await runPollCycle(client).catch((error) => {
      logger.error({ err: error }, "Falha no ciclo de polling.");
    });
  };

  void execute();
  return setInterval(() => {
    void execute();
  }, intervalMs);
}