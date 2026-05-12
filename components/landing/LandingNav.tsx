'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features',  href: '#features'  },
  { label: 'Pricing',   href: '#pricing'   },
  { label: 'Roles',     href: '#roles'     },
  { label: 'FAQ',       href: '#faq'       },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'h-16 glass-panel border-b border-white/[0.08] shadow-2xl shadow-black/40'
            : 'h-20 bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-full flex items-center justify-between gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              synth<span className="text-[#4f8ef7]">mark</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-1.5 py-1 backdrop-blur-md">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-1.5 text-[13px] font-medium text-white/50 hover:text-white rounded-full hover:bg-white/[0.08] transition-all duration-300"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-[13px] font-bold transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5 active:scale-95"
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          'fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-200 origin-top',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none',
        )}
      >
        <div className="bg-[#0d0d18]/98 backdrop-blur-xl border-b border-white/[0.07] px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex flex-col gap-2">
            <Link
              href="/auth/sign-in"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all text-center"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#4f8ef7] text-white text-sm font-semibold"
            >
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
