import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  LayoutDashboard,
  FlipHorizontal,
  Brain,
  LogOut,
  Menu,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transpose", label: "Transpose", icon: FlipHorizontal },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Brain },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLink = buttonVariants({ variant: "ghost", size: "sm" });

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const navItemClass = (path: string, mobile = false) =>
    cn(
      navLink,
      mobile && "w-full justify-start gap-2 px-3 py-2.5 h-auto text-base",
      isActive(path) && "bg-muted text-foreground"
    );

  return (
    <nav className="border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/dashboard" className="flex min-w-0 flex-col leading-none">
          <span
            className="font-bold text-[1.25rem]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Transpose<span className="text-primary">Rx</span>
          </span>
          <span
            className="text-[0.6rem] uppercase tracking-widest text-muted-foreground font-normal"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Eye Clinic University
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 shrink-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={navItemClass(to)}>
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)] p-0">
            <SheetHeader className="border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <SheetClose
                  key={to}
                  render={
                    <Link to={to} className={navItemClass(to, true)} />
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </SheetClose>
              ))}
              <Button
                variant="ghost"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mt-1 w-full justify-start gap-2 px-3 py-2.5 h-auto text-base"
                )}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
