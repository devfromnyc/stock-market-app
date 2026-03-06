import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getWatchlistWithData,
  getWatchlistSymbolsByUserId,
} from "@/lib/actions/watchlist.actions";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import WatchlistPageClient from "./WatchlistPageClient";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const email = session.user.email ?? "";
  const [watchlist, watchlistSymbols, initialStocks] = await Promise.all([
    getWatchlistWithData(userId),
    getWatchlistSymbolsByUserId(userId),
    searchStocks(),
  ]);

  // Merge isInWatchlist into initial stocks for Add Stock dialog
  const watchlistSet = new Set(watchlistSymbols.map((s) => s.toUpperCase()));
  const stocksWithStatus = initialStocks.map((s) => ({
    ...s,
    isInWatchlist: watchlistSet.has(s.symbol),
  }));

  return (
    <WatchlistPageClient
      initialWatchlist={watchlist}
      watchlistSymbols={watchlistSymbols}
      initialStocks={stocksWithStatus}
    />
  );
}
