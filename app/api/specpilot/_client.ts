const productApiBase =
  process.env.SPECPILOT_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SPECPILOT_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const productApiKey = process.env.SPECPILOT_API_KEY || "specpilot-site-demo";

type GetJsonOptions = {
  cache?: RequestCache;
  revalidateSeconds?: number;
  timeoutMs?: number;
};

export function productPublicUrl(path: string) {
  return new URL(path, productApiBase).toString();
}

export function productHeaders() {
  return {
    "Content-Type": "application/json",
    "X-SpecPilot-Key": productApiKey,
  };
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${productApiBase}${path}`, {
    method: "POST",
    headers: productHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function patchJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${productApiBase}${path}`, {
    method: "PATCH",
    headers: productHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchJson<T>(path: string, options: GetJsonOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: "GET",
    headers: productHeaders(),
    cache: options.cache ?? "no-store",
    signal: controller.signal,
  };

  if (options.revalidateSeconds !== undefined) {
    init.next = { revalidate: options.revalidateSeconds };
  }

  let response: Response;
  try {
    response = await fetch(`${productApiBase}${path}`, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${path} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getJson<T>(path: string): Promise<T> {
  return fetchJson<T>(path);
}

export async function getCachedJson<T>(
  path: string,
  options: GetJsonOptions = {},
): Promise<T> {
  return fetchJson<T>(path, {
    cache: "force-cache",
    revalidateSeconds: 15,
    timeoutMs: 8_000,
    ...options,
  });
}
