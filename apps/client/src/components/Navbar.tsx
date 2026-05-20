import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  FlipHorizontal,
  Brain,
  LogOut,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  const navLink = buttonVariants({ variant: "ghost", size: "sm" });

  return (
    <nav className="border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col leading-none">
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
        <div className="flex items-center gap-1">
          <Link to="/dashboard" className={navLink}>
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <Link to="/transpose" className={navLink}>
            <FlipHorizontal className="h-4 w-4 mr-1" />
            Transpose
          </Link>
          <Link to="/lessons" className={navLink}>
            <BookOpen className="h-4 w-4 mr-1" />
            Lessons
          </Link>
          <Link to="/practice" className={navLink}>
            <Brain className="h-4 w-4 mr-1" />
            Practice
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
