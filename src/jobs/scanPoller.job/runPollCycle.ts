import { ScanStatus, type ScanCase } from "@prisma/client";
import type { Client } from "discord.js";

import { getEchoScanDetails, getEchoScansByPin } from "../../services/echo.service/index.js";
import { buildFiveMSummary } from "../../services/scanResult.service/index.js";
import { updateTrackingPanel } from "../../panels/trackingPanel.js";
import {
  listActiveScans,
  listExpiredScans,
  logScanAction,
  updateScanStatus
} from "../../services/scan.service/index.js";
import { logger } from "../../utils/logger.js";

const FINAL_STATUSES = new Set<ScanStatus>([
  ScanStatus.COMPLETED,
  ScanStatus.FAILED,
  ScanStatus.CANCELLED,
  ScanStatus.EXPIRED
]);

function buildResultSummary(scanCase: ScanCase, summary: string) {
  return summary || scanCase.resultSummary || "Resultado disponível";
}

function pickLatestScan(scans: Array<{ uuid: string; time?: string | null }>) {
  return [...scans].sort((left, right) => {
    const leftTime = left.time ? new Date(left.time).getTime() : 0;
    const rightTime = right.time ? new Date(right.time).getTime() : 0;

    return rightTime - leftTime;
  })[0] ?? null;
}

async function expireCase(client: Client<true>, scanCase: ScanCase) {
  await updateScanStatus({
    scanCaseId: scanCase.id,
    status: ScanStatus.EXPIRED,
    resultSummary: "Tempo limite excedido.",
    completedAt: new Date()
  });

  if (scanCase.trackingMessageId) {
    await updateTrackingPanel({
      client,
      trackingChannelId: scanCase.trackingChannelId,
      trackingMessageId: scanCase.trackingMessageId,
      caseId: scanCase.id,
      staffDiscordId: scanCase.staffDiscordId,
      status: ScanStatus.EXPIRED,
      echoScanId: scanCase.echoScanId,
      createdAt: scanCase.createdAt,
      resultSummary: "Tempo limite excedido.",
      viewResultEnabled: false
    });
  }

  await logScanAction({
    scanCaseId: scanCase.id,
    action: "SCAN_EXPIRED",
    message: "Caso expirado automaticamente por timeout."
  });
}

async function syncCase(client: Client<true>, scanCase: ScanCase) {
  try {
    if (!scanCase.echoPin) {
      throw new Error("Caso sem PIN salvo; não é possível consultar a Echo.");
    }

    let resolvedScanId = scanCase.echoScanId;

    if (!resolvedScanId) {
      const pinMatches = await getEchoScansByPin(scanCase.echoPin);
      const latestScan = pickLatestScan(pinMatches);

      if (!latestScan) {
        await logScanAction({
          scanCaseId: scanCase.id,
          action: "SCAN_PENDING_BY_PIN",
          message: "PIN consultado sem scan disponível ainda.",
          metadata: { echoPin: scanCase.echoPin }
        });

        if (scanCase.trackingMessageId) {
          await updateTrackingPanel({
            client,
            trackingChannelId: scanCase.trackingChannelId,
            trackingMessageId: scanCase.trackingMessageId,
            caseId: scanCase.id,
            staffDiscordId: scanCase.staffDiscordId,
            status: ScanStatus.PENDING,
            echoScanId: null,
            createdAt: scanCase.createdAt,
            resultSummary: "PIN gerado; aguardando envio da varredura para a Echo.",
            viewResultEnabled: false
          });
        }

        return;
      }

      resolvedScanId = latestScan.uuid;

      await updateScanStatus({
        scanCaseId: scanCase.id,
        status: ScanStatus.RUNNING,
        echoScanId: resolvedScanId,
        resultSummary: "Scan localizado pela Echo; carregando resultado detalhado.",
        completedAt: null,
        expiresAt: scanCase.expiresAt
      });

      await logScanAction({
        scanCaseId: scanCase.id,
        action: "SCAN_LINKED_BY_PIN",
        message: "Scan localizado pela consulta do PIN.",
        metadata: { echoPin: scanCase.echoPin, echoScanId: resolvedScanId }
      });
    }

    const response = await getEchoScanDetails(resolvedScanId);
    const nextStatus = response.detection ? ScanStatus.COMPLETED : ScanStatus.RUNNING;
    const isDone = FINAL_STATUSES.has(nextStatus);
    const summary = buildResultSummary(scanCase, buildFiveMSummary(response));

    await updateScanStatus({
      scanCaseId: scanCase.id,
      status: nextStatus,
      echoScanId: response.uuid,
      resultSummary: summary,
      resultRaw: response,
      completedAt: isDone ? new Date(response.time ?? new Date()) : null,
      expiresAt: scanCase.expiresAt
    });

    if (scanCase.trackingMessageId) {
      await updateTrackingPanel({
        client,
        trackingChannelId: scanCase.trackingChannelId,
        trackingMessageId: scanCase.trackingMessageId,
        caseId: scanCase.id,
        staffDiscordId: scanCase.staffDiscordId,
        status: nextStatus,
        echoScanId: response.uuid,
        createdAt: scanCase.createdAt,
        resultSummary: summary,
        viewResultEnabled: nextStatus === ScanStatus.COMPLETED
      });
    }

    await logScanAction({
      scanCaseId: scanCase.id,
      action: "SCAN_POLLED",
      message: `Status atualizado para ${nextStatus}.`,
      metadata: { summary, echoScanId: response.uuid }
    });
  } catch (error) {
    logger.error({ err: error, scanCaseId: scanCase.id }, "Falha ao consultar status na Echo.");
    await logScanAction({
      scanCaseId: scanCase.id,
      action: "SCAN_POLL_ERROR",
      message: error instanceof Error ? error.message : "Erro desconhecido ao consultar Echo"
    });
  }
}

export async function runPollCycle(client: Client<true>) {
  const now = new Date();
  const [expiredCases, activeCases] = await Promise.all([listExpiredScans(now), listActiveScans()]);

  for (const expiredCase of expiredCases) {
    await expireCase(client, expiredCase);
  }

  for (const activeCase of activeCases) {
    if (expiredCases.some((expiredCase) => expiredCase.id === activeCase.id)) {
      continue;
    }

    await syncCase(client, activeCase);
  }
}