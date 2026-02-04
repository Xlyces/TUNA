"use client";

import { useState, useEffect } from "react";
import { signInUser, signOutUser } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Users, 
  X, 
  ChevronDown,
  ChevronUp,
  Database,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const DEMO_USERS = [
  { email: "demo1@tuna.com", password: "demo123", role: "tutor", name: "Tutor 1" },
  { email: "demo2@tuna.com", password: "demo123", role: "tutor", name: "Tutor 2" },
  { email: "demo3@tuna.com", password: "demo123", role: "parent", name: "Parent" },
];

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const { user, userProfile, loading } = useAuth();

  // Only show in development
  // Support both Vite (import.meta.env) and Next.js (process.env)
  const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') ||
                (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  if (!isDev) {
    return null;
  }

  const handleSwitchUser = async (email: string, password: string) => {
    try {
      if (user) {
        await signOutUser();
      }
      await signInUser(email, password);
      setIsOpen(false);
      // Redirect to dashboard after switching user
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error switching user:", error);
      alert(`Failed to switch user: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          size="sm"
          variant="outline"
          className="bg-[hsl(var(--background))] border-[hsl(var(--sky))]/40 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sky))]/10 hover:border-[hsl(var(--sky))] shadow-lg"
        >
          <Settings className="h-4 w-4 mr-2" />
          Dev Tools
        </Button>
      </div>

      {/* Toolbar Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 max-h-[80vh] overflow-y-auto">
          <Card className="shadow-2xl border-[hsl(var(--sky))]/30 bg-[hsl(var(--card))]">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--sky))]/10 to-[hsl(var(--cyan))]/5 pb-3 border-b border-[hsl(var(--sky))]/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Settings className="h-4 w-4 text-[hsl(var(--sky))]" />
                  Developer Tools
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                  >
                    {isMinimized ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="pt-4 space-y-4 bg-[hsl(var(--card))]">
                {/* Current User Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    <User className="h-3 w-3 text-[hsl(var(--sky))]" />
                    Current User
                  </div>
                  {loading ? (
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">Loading...</div>
                  ) : user ? (
                    <div className="p-3 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--sky))]/20 text-xs">
                      <div className="font-medium text-[hsl(var(--foreground))]">{userProfile?.name || user.email}</div>
                      <div className="text-[hsl(var(--muted-foreground))] mt-1">{user.email}</div>
                      <Badge variant="sky" className="mt-2 text-xs">
                        {userProfile?.role || "unknown"}
                      </Badge>
                      {userProfile?.walletCredits !== undefined && (
                        <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Credits: {userProfile.walletCredits}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">Not signed in</div>
                  )}
                </div>

                {/* Quick User Switch */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    <Users className="h-3 w-3 text-[hsl(var(--sky))]" />
                    Quick Switch
                  </div>
                  <div className="space-y-2">
                    {DEMO_USERS.map((demoUser) => (
                      <Button
                        key={demoUser.email}
                        variant="outline"
                        size="sm"
                        className={`w-full justify-start text-xs h-9 border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sky))]/10 hover:border-[hsl(var(--sky))] ${
                          user?.email === demoUser.email ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleSwitchUser(demoUser.email, demoUser.password)}
                        disabled={user?.email === demoUser.email}
                      >
                        <User className="h-3 w-3 mr-2" />
                        {demoUser.name}
                        <Badge variant="cyan" className="ml-auto text-xs">
                          {demoUser.role}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    <Settings className="h-3 w-3 text-[hsl(var(--sky))]" />
                    Actions
                  </div>
                  <div className="space-y-2">
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs h-9 border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sky))]/10 hover:border-[hsl(var(--sky))]"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-9 border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sky))]/10 hover:border-[hsl(var(--sky))]"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Reload Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-9 border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sky))]/10 hover:border-[hsl(var(--sky))]"
                      onClick={() => window.open("http://localhost:4000", "_blank")}
                    >
                      <Database className="h-3 w-3 mr-2" />
                      Firebase Emulator
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="pt-3 border-t border-[hsl(var(--sky))]/20 text-xs">
                  <div className="flex items-center gap-1 mb-2">
                    <CreditCard className="h-3 w-3 text-[hsl(var(--sky))]" />
                    <span className="font-semibold text-[hsl(var(--muted-foreground))]">Mock Payments Active</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Stripe API is mocked. No real payments will be processed.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

