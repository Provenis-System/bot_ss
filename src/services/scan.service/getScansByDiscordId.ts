import { prisma } from "../../database/prisma.js";

export type ScanSummary = {
  id: string;
  echoPin: string | null;
  trackingChannelId: string;
  trackingMessageId: string | null;
  selectedGame: string | null;
  status: string;
  createdAt: Date;
};

export async function getScansByDiscordId(discordId: string): Promise<ScanSummary[]> {
  // Busca scan cases onde o Discord ID aparece no array resultRaw.accounts
  const rows = await prisma.$queryRaw<ScanSummary[]>`
    SELECT
      id,
      echo_pin       AS "echoPin",
      tracking_channel_id  AS "trackingChannelId",
      tracking_message_id  AS "trackingMessageId",
      selected_game  AS "selectedGame",
      status::text,
      created_at     AS "createdAt"
    FROM scan_cases
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text((result_raw::jsonb) -> 'accounts') AS acc
      WHERE acc ILIKE ${'discord:' + discordId + '%'}
    )
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return rows;
}
