const productApiBase =
  process.env.SPECPILOT_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SPECPILOT_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const productApiKey = process.env.SPECPILOT_API_KEY || "specpilot-site-demo";

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

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${productApiBase}${path}`, {
    method: "GET",
    headers: productHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
