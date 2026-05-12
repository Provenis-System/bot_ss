export function formatDetectionLabel(detection?: string | null): string {
  const normalized = detection?.trim().toLowerCase();

  switch (normalized) {
    case "clean":
      return "Clean";
    case "unusual":
      return "Unusual";
    case "cheating":
    case "detected":
      return "Detected";
    default:
      return detection?.trim() || "Indefinido";
  }
}