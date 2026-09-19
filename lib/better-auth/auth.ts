import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

type AuthInstance = ReturnType<typeof betterAuth>;

let authInstance: AuthInstance | null = null;
let authPromise: Promise<AuthInstance> | null = null;
let lastAuthErrorAt = 0;
const AUTH_RETRY_MS = 15_000;

const getBaseURL = () =>
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const getAuth = async () => {
  if (authInstance) return authInstance;
  if (authPromise) return authPromise;
  if (lastAuthErrorAt && Date.now() - lastAuthErrorAt < AUTH_RETRY_MS) {
    throw new Error("MongoDB unavailable");
  }

  authPromise = (async () => {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("MongoDB connection not found");
    }

    const baseURL = getBaseURL();

    authInstance = betterAuth({
      database: mongodbAdapter(db as any),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL,
      trustedOrigins: [
        baseURL,
        process.env.NEXT_PUBLIC_BASE_URL,
        "https://stock-market-app-beta-eight.vercel.app",
      ].filter((origin): origin is string => Boolean(origin)),
      emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 124,
      },
      plugins: [nextCookies()],
    });

    return authInstance;
  })();

  try {
    return await authPromise;
  } catch (error) {
    authPromise = null;
    lastAuthErrorAt = Date.now();
    throw error;
  }
};

export async function getServerSession() {
  const requestHeaders = await headers();

  try {
    const auth = await getAuth();
    return auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error("Failed to get auth session:", error);
    return null;
  }
}
