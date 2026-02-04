import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInUser } from "@/lib/firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInUser(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 -mt-16">
      {/* Deep dark blue base layer */}
      <div className="absolute inset-0 bg-[hsl(var(--navy))]" />

      {/* Animated gradient layer */}
      <div className="absolute inset-0 bg-gradient-depth light-rays" />

      {/* Animated wave pattern overlay */}
      <div className="absolute inset-0 wave-pattern opacity-30" />

      {/* Bubble effects */}
      <div className="absolute inset-0 bg-gradient-bubble opacity-20" />

      {/* Depth layers */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[hsl(var(--sky))]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(var(--navy))]/30 to-transparent" />

      <Card className="relative z-10 w-full max-w-md bg-[hsl(var(--card))] border-[hsl(var(--sky))]/30 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-[hsl(var(--foreground))]">Sign In</CardTitle>
          <CardDescription className="text-center">
            Welcome back to TUNA Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-ocean text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-[hsl(var(--sky))] hover:text-[hsl(var(--cyan))] hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

