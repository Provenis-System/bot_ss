import type { SupportedGameKey } from "../../types/game.js";

import { SUPPORTED_GAMES } from "./catalog.js";

export function assertSupportedGame(value: string): SupportedGameKey {
  const match = SUPPORTED_GAMES.find((option) => option.key === value);
  if (!match) {
    throw new Error("Jogo selecionado não é suportado pelo painel.");
  }

  return match.key;
}