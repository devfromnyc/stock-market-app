"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SearchCommand from "@/components/SearchCommand";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type WatchlistItem = {
  symbol: string;
  company: string;
  addedAt: Date;
  currentPrice?: number;
  changePercent?: number;
  priceFormatted?: string;
  changeFormatted?: string;
  marketCap?: string;
};

type StockWithWatchlistStatus = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  isInWatchlist: boolean;
};

export default function WatchlistPageClient({
  initialWatchlist,
  watchlistSymbols,
  initialStocks,
}: {
  initialWatchlist: WatchlistItem[];
  watchlistSymbols: string[];
  initialStocks: StockWithWatchlistStatus[];
}) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState(initialWatchlist);

  const handleAddToWatchlist = async (symbol: string, company: string) => {
    const res = await addToWatchlist(symbol, company);
    if (res.success) {
      toast.success(`Added ${symbol} to watchlist`);
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to add");
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    const res = await removeFromWatchlist(symbol);
    if (res.success) {
      toast.success(`Removed ${symbol} from watchlist`);
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to remove");
    }
  };

  const handleWatchlistChange = async (symbol: string, isAdded: boolean) => {
    if (isAdded) {
      await handleAddToWatchlist(symbol, symbol);
    } else {
      await handleRemoveFromWatchlist(symbol);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Watchlist Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Watchlist</h2>
          <SearchCommand
            renderAs="button"
            label="Add Stock"
            initialStocks={initialStocks}
            watchlistSymbols={new Set(watchlistSymbols.map((s) => s.toUpperCase()))}
            onWatchlistChange={handleWatchlistChange}
            onStockAdded={() => router.refresh()}
          />
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Company</TableHead>
                <TableHead className="text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Change</TableHead>
                <TableHead className="text-muted-foreground">Market Cap</TableHead>
                <TableHead className="text-muted-foreground">P/E Ratio</TableHead>
                <TableHead className="text-muted-foreground">Alert</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No stocks in your watchlist. Click &quot;Add Stock&quot; to add some.
                  </TableCell>
                </TableRow>
              ) : (
                watchlist.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveFromWatchlist(item.symbol)}
                          className="text-yellow-500 hover:text-yellow-400 transition-colors"
                          title="Remove from watchlist"
                          aria-label={`Remove ${item.symbol} from watchlist`}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                        <Link
                          href={`/stocks/${item.symbol}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {item.company}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.symbol}</TableCell>
                    <TableCell>{item.priceFormatted ?? "-"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          (item.changePercent ?? 0) >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                        }
                      >
                        {item.changeFormatted ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell>{item.marketCap ?? "-"}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-amber-700 border-amber-700/50">
                        Add Alert
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWatchlist(item.symbol)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
          <Button size="sm" className="bg-primary text-primary-foreground">
            Create Alert
          </Button>
        </div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No alerts set. Create an alert to get notified when a stock reaches your target price.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
