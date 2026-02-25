import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="auth-layout">
      <section className="auth-left-section scrollbar-hide-default">
        <Link href="/" className="auth-logo">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist Logo"
            width={140}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
        <div className="pb-6 lg:pb-8 flex-1">{children}</div>
      </section>
      <section className="auth-right-section">
        <div className="z-10 relative lg:mt-4 lg:mb-16">
          <blockquote className="auth-blockquote">
            Signalist turned my watchlist into a winning edge. The alerts are
            spot on and I feel more confident making moves in the market
          </blockquote>
          <div className="flex items-center justify-between">
            <div>
              <cite className="auth-testimonial-author">James Jannetti</cite>
              <p className="max-md:text-sx text-gray-500">Retail Investor</p>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  src="/assets/icons/star.svg"
                  alt="Star"
                  width={16}
                  height={16}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="auth-dashboard-preview">
          <Image
            src="/assets/images/dashboard-preview.png"
            alt="Dashboard Preview"
            width={1024}
            height={1024}
          />
        </div>
      </section>
    </main>
  );
};

export default Layout;
