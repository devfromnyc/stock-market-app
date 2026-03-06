"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "../hooks/useDebounce";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
  watchlistSymbols,
  onWatchlistChange,
  onStockAdded,
}: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const mergeWatchlistStatus = (s: StockWithWatchlistStatus) => ({
    ...s,
    isInWatchlist: watchlistSymbols?.has(s.symbol) ?? s.isInWatchlist,
  });

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = (isSearchMode ? stocks : stocks?.slice(0, 10))?.map(
    mergeWatchlistStatus,
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true);
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results.map((r) => mergeWatchlistStatus(r)));
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  const handleStarClick = async (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const nextAdded = !(watchlistSymbols?.has(stock.symbol) ?? stock.isInWatchlist);

    if (onWatchlistChange) {
      await onWatchlistChange(stock.symbol, nextAdded);
    } else {
      if (nextAdded) {
        const res = await addToWatchlist(stock.symbol, stock.name);
        if (res.success) {
          toast.success(`Added ${stock.symbol} to watchlist`);
          onStockAdded?.();
          router.refresh();
        } else toast.error(res.error ?? "Failed to add");
      } else {
        const res = await removeFromWatchlist(stock.symbol);
        if (res.success) {
          toast.success(`Removed ${stock.symbol} from watchlist`);
          onStockAdded?.();
          router.refresh();
        } else toast.error(res.error ?? "Failed to remove");
      }
    }
    // Optimistic local state update
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === stock.symbol ? { ...s, isInWatchlist: nextAdded } : s,
      ),
    );
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog">
        <div className="search-field">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="search-input"
          />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? "Search results" : "Popular stocks"}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock) => {
                const inList = watchlistSymbols?.has(stock.symbol) ?? stock.isInWatchlist;
                return (
                  <li key={stock.symbol} className="search-item">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="search-item-link">
                      <TrendingUp className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange || "—"} | {stock.type}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleStarClick(e, stock)}
                        className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                        aria-label={
                          inList
                            ? `Remove ${stock.symbol} from watchlist`
                            : `Add ${stock.symbol} to watchlist`
                        }
                        title={
                          inList
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }>
                        <Star
                          className={`h-4 w-4 ${
                            inList ? "fill-yellow-500 text-yellow-500" : "text-gray-500"
                          }`}
                        />
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
