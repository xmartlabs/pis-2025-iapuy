
import type { LoginContextType } from "@/app/context/login-context";

interface FetchWithAuthOptions extends RequestInit {
  triedRefresh?: boolean;
}
export async function fetchWithAuth(
  context: LoginContextType,
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { triedRefresh = false, ...fetchOptions } = options;
  const token = context.tokenJwt;

  const headers = {
    Accept: "application/json",
    ...(fetchOptions.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const resp = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (resp.ok) return resp;

  if (resp.status === 401 && !triedRefresh) {
    const refreshResp = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (refreshResp.ok) {
      const refreshBody = (await refreshResp.json().catch(() => null)) as {
        accessToken?: string;
      } | null;
      const newToken = refreshBody?.accessToken ?? null;

      if (newToken) {
        context.setToken(newToken);
        return await fetch(url, {
          ...fetchOptions,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }
  }
  return resp;
}
