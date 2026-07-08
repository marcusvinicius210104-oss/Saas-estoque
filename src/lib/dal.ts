import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const requireAdmin = cache(async () => {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
});
