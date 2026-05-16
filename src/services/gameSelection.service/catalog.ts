import type { SupportedGameOption } from "../../types/game.js";

export const SUPPORTED_GAMES: SupportedGameOption[] = [
  { key: "fivem", label: "FiveM", description: "GTA-V RP / FiveM" },
  { key: "gtav", label: "GTA V", description: "Scanner geral de GTA V" },
  { key: "redm", label: "RedM", description: "Scanner para RedM" },
  { key: "gmod", label: "GMod", description: "Scanner para Garry's Mod" },
  { key: "rust", label: "Rust", description: "Scanner para Rust" },
  { key: "roblox", label: "Roblox", description: "Scanner para Roblox" },
  { key: "minecraft", label: "Minecraft", description: "Scanner para Minecraft Java" },
  { key: "bedrock", label: "Bedrock", description: "Scanner para Minecraft Bedrock" },
  { key: "counter-strike", label: "Counter-Strike", description: "Scanner para CS" },
  { key: "dayz", label: "DayZ", description: "Scanner para DayZ" }
];