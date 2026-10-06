"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const sessionCookie = "stats-session";
const sessionMessage = "stats-session-v1";

function getSessionToken(password: string) {
  return createHmac("sha256", password).update(sessionMessage).digest("hex");
}

function tokensMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function isStatsAuthenticated() {
  const password = process.env.STATS_PASSWORD;
  const token = (await cookies()).get(sessionCookie)?.value;
  return Boolean(password && token && tokensMatch(token, getSessionToken(password)));
}

export async function authenticateStats(formData: FormData) {
  const password = process.env.STATS_PASSWORD;
  const suppliedPassword = String(formData.get("password") ?? "");

  if (!password || !tokensMatch(suppliedPassword, password)) {
    redirect("/stats?error=invalid-password");
  }

  (await cookies()).set(sessionCookie, getSessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/stats",
  });

  redirect("/stats");
}
