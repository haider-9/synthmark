'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, ArrowRight, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Features',  href: '#features'  },
  { label: 'Pricing',   href: '#pricing'   },
  { label: 'Roles',     href: '#roles'     },
  { label: 'FAQ',       href: '#faq'       },
];

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

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
            ? 'h-16 border-b border-border bg-background/92 shadow-xl backdrop-blur-2xl'
            : 'h-20 bg-background',
        )}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-full flex items-center justify-between gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-md overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image height={1000} width={1000} src="/logo.png" alt="Synthmark" className="w-full h-full object-cover" />
            </div>
            <span className='font-bold text-lg tracking-tight text-foreground' >synth<span className='text-foreground'>mark</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className={cn(
              'hidden md:flex items-center gap-1 rounded-md border px-1.5 py-1 backdrop-blur-md',
              scrolled ? 'border-border bg-muted/50' : 'border-border bg-card/80',
            )}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  'px-4 py-1.5 text-[13px] font-medium rounded transition-all duration-300',
                  scrolled
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/sign-in"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-foreground/70 hover:text-foreground',
              )}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-md text-[13px] font-bold transition-all active:scale-95',
                scrolled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-accent text-accent-foreground hover:bg-accent/90',
              )}
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'md:hidden flex items-center justify-center w-9 h-9 rounded-md transition-colors',
              scrolled
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
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
        <div className="bg-background/98 backdrop-blur-xl border-b border-border px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-all"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
            <div className="flex justify-center py-1">
              <ThemeToggle />
            </div>
            <Link
              href="/auth/sign-in"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-all text-center"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
            >
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
