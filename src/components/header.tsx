
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, BookOpenText, MessageSquare, PenSquare, Mic, Headphones, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth-hook';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useMounted } from '@/hooks/use-mounted';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/study-plan', label: 'Study Plan', icon: BookOpenText },
  { href: '/writing', label: 'Writing', icon: PenSquare },
  { href: '/speaking', label: 'Speaking', icon: Mic },
  { href: '/listening', label: 'Listening', icon: Headphones },
  { href: '/mentor', label: 'AI Mentor', icon: MessageSquare },
];

function NavLink({ href, label, icon: Icon, onLinkClick }: { href: string; label: string; icon: React.ElementType; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link href={href} className="w-full" onClick={onLinkClick}>
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

function UserNav() {
  const { user, loading, logout } = useAuth();
  const mounted = useMounted();

  if (!mounted || loading) {
    return <div className="h-10 w-10 rounded-full bg-secondary" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/auth">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || ''} alt={user.name || user.email || ''} />
            <AvatarFallback>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          {user && (
            <div className="md:hidden mr-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                        <NavLink key={link.href} {...link} onLinkClick={() => setIsSheetOpen(false)} />
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary">
              <rect width="256" height="256" fill="none"></rect>
              <path d="M41.4,144A96,96,0,0,1,128,54.3,95.4,95.4,0,0,1,214.6,144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,201.7a96,96,0,0,1-86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,201.7a96,96,0,0,0,86.6-90.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            </svg>
            <span className="font-bold font-headline sm:inline-block">ShikhiLab</span>
          </Link>
          {user && (
            <nav className="ml-6 hidden items-center space-x-4 text-sm font-medium md:flex">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname.startsWith(link.href) ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
