"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "../../database/models/watchlist.model";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function addToWatchlist(symbol: string, company: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "Database not connected" };

    await Watchlist.findOneAndUpdate(
      { userId, symbol: symbol.toUpperCase().trim() },
      { $set: { userId, symbol: symbol.toUpperCase().trim(), company: company.trim() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err) {
    console.error("addToWatchlist error:", err);
    return { success: false, error: "Failed to add to watchlist" };
  }
}

export async function removeFromWatchlist(symbol: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase().trim() });
    return { success: true };
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    return { success: false, error: "Failed to remove from watchlist" };
  }
}

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Better Auth stores users in the "user" collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    const items = await Watchlist.find<{ symbol: unknown }>(
      { userId },
      { symbol: 1 },
    ).lean();

    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}

export async function getWatchlistSymbolsByUserId(
  userId: string,
): Promise<string[]> {
  if (!userId) return [];
  try {
    const items = await Watchlist.find<{ symbol: unknown }>(
      { userId },
      { symbol: 1 },
    ).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByUserId error:", err);
    return [];
  }
}

export async function getWatchlistWithData(userId: string): Promise<
  Array<{
    symbol: string;
    company: string;
    addedAt: Date;
    currentPrice?: number;
    changePercent?: number;
    priceFormatted?: string;
    changeFormatted?: string;
    marketCap?: string;
  }>
> {
  if (!userId) return [];
  try {
    const { getQuotes } = await import("./finnhub.actions");
    const items = await Watchlist.find({ userId })
      .sort({ addedAt: -1 })
      .lean();
    const symbols = items.map((i) => String(i.symbol));
    const quotes = await getQuotes(symbols);

    return items.map((item) => {
      const sym = String(item.symbol);
      const company = String(item.company || sym);
      const q = quotes[sym];
      const currentPrice = q?.c;
      const changePercent = q?.dp;
      const priceFormatted =
        currentPrice != null
          ? `$${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          : undefined;
      const changeFormatted =
        changePercent != null
          ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`
          : undefined;
      const marketCap = undefined; // Finnhub profile2 has marketCap but requires extra calls
      return {
        symbol: sym,
        company,
        addedAt: (item as any).addedAt ?? new Date(),
        currentPrice,
        changePercent,
        priceFormatted,
        changeFormatted,
        marketCap,
      };
    });
  } catch (err) {
    console.error("getWatchlistWithData error:", err);
    return [];
  }
}
