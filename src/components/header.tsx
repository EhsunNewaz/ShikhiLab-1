'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpenText, MessageSquare, PenSquare, Mic, Headphones, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/writing', label: 'Writing', icon: PenSquare },
  { href: '/mentor', label: 'AI Mentor', icon: MessageSquare },
  { href: '/speaking', label: 'Speaking', icon: Mic },
  { href: '/listening', label: 'Listening', icon: Headphones },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/writing' && pathname === '/');

  return (
    <Link href={href} className="w-full">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn('w-full justify-start', {
          'bg-primary/10 text-primary': isActive,
        })}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary">
              <rect width="256" height="256" fill="none"></rect>
              <path d="M41.4,144A96,96,0,0,1,128,54.3,95.4,95.4,0,0,1,214.6,144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,201.7a96,96,0,0,1-86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,201.7a96,96,0,0,0,86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            </svg>
            <span className="hidden font-bold sm:inline-block font-headline">ShikhiLab</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.slice(0, 2).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href || (link.href === '/writing' && pathname === '/') ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 pt-8">
              <Link href="/" className="flex items-center space-x-2 px-4">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary">
                  <rect width="256" height="256" fill="none"></rect>
                  <path d="M41.4,144A96,96,0,0,1,128,54.3,95.4,95.4,0,0,1,214.6,144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                  <path d="M128,201.7a96,96,0,0,1-86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                  <path d="M128,201.7a96,96,0,0,0,86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                  <line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                </svg>
                <span className="font-bold font-headline">ShikhiLab</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] overflow-y-auto px-2">
                <div className="flex flex-col space-y-1">
                  {navLinks.map(link => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
