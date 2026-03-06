"use client";

import { useRouter } from "next/navigation";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistButton from "./WatchlistButton";
import { toast } from "sonner";

export default function StockPageWatchlistButton({
  symbol,
  company,
  isInWatchlist,
}: {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
}) {
  const router = useRouter();

  const handleWatchlistChange = async (sym: string, isAdded: boolean) => {
    if (isAdded) {
      const res = await addToWatchlist(sym, company);
      if (res.success) {
        toast.success(`Added ${sym} to watchlist`);
        router.refresh();
      } else toast.error(res.error ?? "Failed to add");
    } else {
      const res = await removeFromWatchlist(sym);
      if (res.success) {
        toast.success(`Removed ${sym} from watchlist`);
        router.refresh();
      } else toast.error(res.error ?? "Failed to remove");
    }
  };

  return (
    <WatchlistButton
      symbol={symbol}
      company={company}
      isInWatchlist={isInWatchlist}
      onWatchlistChange={handleWatchlistChange}
    />
  );
}
