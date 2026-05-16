import type { SupportedGameKey } from "../../types/game.js";

import { SUPPORTED_GAMES } from "./catalog.js";

export function getGameOption(game: SupportedGameKey) {
  return SUPPORTED_GAMES.find((option) => option.key === game) ?? null;
}