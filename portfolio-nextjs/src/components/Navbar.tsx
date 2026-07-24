'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  YoutubeIcon,
  MenuIcon,
  SearchIcon,
  BellIcon,
  DashboardIcon,
  HomeIcon,
} from './icons';

export function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#2a2a2a]">
      <div className="flex items-center justify-between h-14 px-4 max-w-[1800px] mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-[#272727] rounded-full transition-colors"
            aria-label="Menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-1.5">
            <YoutubeIcon className="w-7 h-7 text-[#ff0000]" />
            <span className="font-semibold text-lg tracking-tight hidden sm:block">
              NathanDev
            </span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-[640px] mx-4">
          <div className="flex items-center w-full">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full h-10 px-4 bg-[#121212] border border-[#2a2a2a] rounded-l-full text-sm text-[#f1f1f1] placeholder-[#888] focus:outline-none focus:border-[#3ea6ff]"
              readOnly
              onClick={() => window.location.href = '/'}
            />
            <button className="h-10 px-5 bg-[#222] border border-l-0 border-[#2a2a2a] rounded-r-full hover:bg-[#333] transition-colors">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-[#272727] rounded-lg transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/managesite"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-[#272727] rounded-lg transition-colors"
          >
            <DashboardIcon className="w-5 h-5" />
            <span>Manage</span>
          </Link>
          <button className="p-2 hover:bg-[#272727] rounded-full transition-colors" aria-label="Notifications">
            <BellIcon className="w-6 h-6" />
          </button>
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-xs font-bold hover:bg-[#cc0000] transition-colors"
          >
            N
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-[#2a2a2a] bg-[#0f0f0f] p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#272727] rounded-lg transition-colors text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </Link>
            <Link
              href="/managesite"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#272727] rounded-lg transition-colors text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <DashboardIcon className="w-5 h-5" />
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
