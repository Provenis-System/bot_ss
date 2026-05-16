export type SupportedGameKey =
  | "fivem"
  | "gtav"
  | "redm"
  | "gmod"
  | "rust"
  | "roblox"
  | "minecraft"
  | "bedrock"
  | "counter-strike"
  | "dayz";

export type SupportedGameOption = {
  key: SupportedGameKey;
  label: string;
  description: string;
};