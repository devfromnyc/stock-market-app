import React from "react";

const Header: () => Element = () => {
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          <ul className="header-nav-list">
            {/* Nav Items */}
            {/* User Dropdown */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
