"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const sessionCookie = "stats-session";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4444";

type LoginResponse = {
  access_token?: unknown;
  accessToken?: unknown;
  jwt_token?: unknown;
  token?: unknown;
};

function getAccessToken(body: LoginResponse) {
  for (const value of [body.jwt_token, body.access_token, body.accessToken, body.token]) {
    if (typeof value === "string" && value.length > 0) return value;
  }

  return null;
}

function isLoginResponse(body: unknown): body is LoginResponse {
  return typeof body === "object" && body !== null;
}

function clearSessionCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  for (const path of ["/", "/stats"]) {
    cookieStore.delete({ name: sessionCookie, path });
    cookieStore.set({
      name: sessionCookie,
      value: "",
      expires: new Date(0),
      maxAge: 0,
      path,
    });
  }
}

export async function isStatsAuthenticated() {
  return Boolean((await cookies()).get(sessionCookie)?.value);
}

export async function getStatsSessionToken() {
  return (await cookies()).get(sessionCookie)?.value ?? null;
}

export async function authenticateStats(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  const suppliedPassword = String(formData.get("password") ?? "");

  if (!["staff", "player"].includes(role) || !suppliedPassword) {
    redirect("/stats?error=invalid-input");
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, password: suppliedPassword }),
      cache: "no-store",
    });
  } catch {
    redirect("/stats?error=backend-unavailable");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    redirect("/stats?error=backend-error");
  }

  if (!response.ok) {
    redirect(`/stats?error=${response.status === 401 ? "invalid-password" : "backend-error"}`);
  }

  const token = isLoginResponse(body) ? getAccessToken(body) : null;
  if (!token) {
    redirect("/stats?error=backend-error");
  }

  clearSessionCookies(await cookies());
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  redirect("/stats");
}

export async function logoutStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${backendUrl}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    await response.json();
  } catch {
    // Clear the local session even when the backend is unavailable.
  }

  clearSessionCookies(cookieStore);
  redirect("/");
}
