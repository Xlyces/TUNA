import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/lib/firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone852, setPhone852] = useState("");
  const [role, setRole] = useState<"tutor" | "parent" | "admin">("parent");
  const [selectedRoleType, setSelectedRoleType] = useState<"tutor" | "student" | "parent">("parent");
  
  const handleRoleSelect = (roleType: "tutor" | "student" | "parent") => {
    setSelectedRoleType(roleType);
    // Both student and parent map to "parent" role internally
    if (roleType === "tutor") {
      setRole("tutor");
    } else {
      setRole("parent");
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(email, password, name, phone852, role);
      toast({
        title: "Account Created",
        description: "Welcome to TUNA! Your account has been created successfully.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      toast({
        title: "Registration Failed",
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
          <CardTitle className="text-3xl font-bold text-center text-[hsl(var(--foreground))]">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join TUNA Platform
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="phone">Phone (+852)</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone852}
                onChange={(e) => setPhone852(e.target.value)}
                placeholder="+85212345678"
                disabled={loading}
              />
            </div>
            <div className="space-y-3">
              <Label>I am a</Label>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant={selectedRoleType === "tutor" ? "default" : "outline"}
                  className={`w-full ${
                    selectedRoleType === "tutor"
                      ? "bg-gradient-ocean text-white hover:opacity-90 border-[hsl(var(--sky))]"
                      : "border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:border-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))]/10"
                  }`}
                  onClick={() => handleRoleSelect("tutor")}
                  disabled={loading}
                >
                  Tutor
                </Button>
                <Button
                  type="button"
                  variant={selectedRoleType === "student" ? "default" : "outline"}
                  className={`w-full ${
                    selectedRoleType === "student"
                      ? "bg-gradient-ocean text-white hover:opacity-90 border-[hsl(var(--sky))]"
                      : "border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:border-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))]/10"
                  }`}
                  onClick={() => handleRoleSelect("student")}
                  disabled={loading}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={selectedRoleType === "parent" ? "default" : "outline"}
                  className={`w-full ${
                    selectedRoleType === "parent"
                      ? "bg-gradient-ocean text-white hover:opacity-90 border-[hsl(var(--sky))]"
                      : "border-[hsl(var(--sky))]/30 text-[hsl(var(--foreground))] hover:border-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))]/10"
                  }`}
                  onClick={() => handleRoleSelect("parent")}
                disabled={loading}
              >
                  Parent of Student
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-ocean text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[hsl(var(--sky))] hover:text-[hsl(var(--cyan))] hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

