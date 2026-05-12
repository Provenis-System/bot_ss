import { env } from "../../config/env.js";

export async function echoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(new URL(path, env.ECHO_API_BASE_URL), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: env.ECHO_API_KEY,
      ...(init?.headers ?? {})
    }
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = (await response.json().catch(() => null)) as T | { message?: string; error?: string } | null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && data.message) ||
      (data && typeof data === "object" && "error" in data && data.error) ||
      `Echo API retornou ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}