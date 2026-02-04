import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletConnect } from "@/components/WalletConnect";
import { onAuthStateChange, getUserProfile, signOutUser, UserProfile } from "@/lib/firebase/auth";
import { TunaLogo } from "@/components/shared/TunaLogo";

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => pathname === path;
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const shouldBeTransparent = isHomePage || isAuthPage;
  const [isScrolled, setIsScrolled] = useState(!shouldBeTransparent);

  useEffect(() => {
    if (!shouldBeTransparent) {
      setIsScrolled(true);
      return;
    }

    // Check initial scroll position - transparent until 1 screen height
    const viewportHeight = window.innerHeight;
    setIsScrolled(window.scrollY > viewportHeight);

    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      setIsScrolled(window.scrollY > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldBeTransparent]);

  const navLinks = userProfile
    ? userProfile.role === "parent"
      ? [
        { href: "/dashboard/parent", label: "Dashboard" },
        { href: "/search", label: "Find Tutors" },
        { href: "/bookings", label: "Bookings" },
      ]
      : userProfile.role === "tutor"
        ? [
          { href: "/dashboard/tutor", label: "Dashboard" },
          { href: "/tutor/profile", label: "Profile" },
        ]
        : [
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/verifications", label: "Verifications" },
        ]
    : [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !shouldBeTransparent
        ? 'bg-[hsl(var(--background))]' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <TunaLogo className={cn(
              "h-8 w-auto group-hover:opacity-80 transition-opacity",
              isScrolled || !shouldBeTransparent ? "" : "[&_text]:fill-white"
            )} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium px-3 py-1.5 rounded-md transition-all ease-in-out duration-300",
                  "hover:text-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))]/10 hover:underline hover:underline-offset-4 hover:scale-105",
                  isActive(link.href) && "text-[hsl(var(--sky))] bg-[hsl(var(--sky))]/20 underline underline-offset-4",
                  !isActive(link.href) && (isScrolled || !shouldBeTransparent 
                    ? "text-[hsl(var(--muted-foreground))]" 
                    : "text-white/70 hover:text-white")
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {userProfile ? (
                  <>
                    <WalletConnect />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar>
                            <AvatarImage src={userProfile.email} />
                            <AvatarFallback>
                              {userProfile.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {userProfile.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {userProfile.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className={isScrolled || !shouldBeTransparent ? "" : "text-white hover:text-white hover:bg-white/10"}
                      asChild
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button 
                      className={isScrolled || !shouldBeTransparent 
                        ? "bg-gradient-ocean text-white hover:opacity-90" 
                        : "bg-white/10 text-white hover:bg-white/20 border-white/20"}
                      asChild
                    >
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                isScrolled || !shouldBeTransparent ? "" : "text-white hover:text-white hover:bg-white/10"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={cn(
            "md:hidden border-t py-4 space-y-2",
            isScrolled || !shouldBeTransparent 
              ? "border-[hsl(var(--border))]" 
              : "border-white/20"
          )}>
            {navLinks.map((link) => (
                <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-all ease-in-out duration-200",
                  "hover:underline hover:underline-offset-4",
                  isActive(link.href) && "bg-[hsl(var(--sky))]/20 text-[hsl(var(--sky))]",
                  !isActive(link.href) && (isScrolled || !shouldBeTransparent
                    ? "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--sky))]"
                    : "text-white/70 hover:text-white hover:bg-white/10")
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!userProfile && (
              <div className="px-3 space-y-2">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full",
                    isScrolled || !shouldBeTransparent 
                      ? "" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                  asChild
                >
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button 
                  className={cn(
                    "w-full",
                    isScrolled || !shouldBeTransparent 
                      ? "" 
                      : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                  asChild
                >
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

