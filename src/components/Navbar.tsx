import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { SITE_PREFERENCES } from "@/data/site";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span>Tastely</span>
        </Link>
        <nav className="flex items-center gap-2">
          {SITE_PREFERENCES.showAbout && (
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              About Us
            </Link>
          )}
          {SITE_PREFERENCES.showCareers && (
            <Link
              to="/careers"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Careers
            </Link>
          )}
          <Link to="/menu" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Menu
          </Link>
          <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Profile
          </Link>
          {user && (
            <Link
              to="/menu"
              hash="recent-orders"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Orders
            </Link>
          )}
          {SITE_PREFERENCES.showHelp && (
            <Link
              to="/help"
              className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:inline"
            >
              Help Center
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary/60">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:block text-sm text-muted-foreground mr-2">{user.email}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
