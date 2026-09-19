import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

const Header = async ({ user }: { user?: User | null }) => {
  const [initialStocks, watchlistSymbols] = await Promise.all([
    searchStocks(),
    getWatchlistSymbolsByEmail(user?.email ?? ""),
  ]);

  const watchlistSet = new Set(watchlistSymbols.map((s) => s.toUpperCase()));
  const stocksWithStatus = initialStocks.map((s) => ({
    ...s,
    isInWatchlist: watchlistSet.has(s.symbol),
  }));

  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          <NavItems
            initialStocks={stocksWithStatus}
            watchlistSymbols={watchlistSet}
          />
        </nav>

        {user ? (
          <UserDropdown user={user} initialStocks={stocksWithStatus} />
        ) : (
          <Button asChild className="yellow-btn">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
export default Header