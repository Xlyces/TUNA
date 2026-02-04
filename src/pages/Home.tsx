import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, CreditCard, Users } from "lucide-react";

export default function HomePage() {
  // #region agent log - Check component render and computed styles
  React.useEffect(() => {
    const hero = document.querySelector('section');
    if (hero) {
      const computed = getComputedStyle(hero);
      const bgColor = computed.backgroundColor;
      const primaryVar = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const coralVar = getComputedStyle(document.documentElement).getPropertyValue('--coral').trim();

      fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Home.tsx:useEffect', message: 'Hero section styles', data: { bgColor, primaryVar, coralVar, hasHero: !!hero }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    }
  }, []);
  // #endregion

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden h-screen flex items-center -mt-16">
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

        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.6s_ease-out]">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient-ocean">Cast Your Line.</span>
              <br />
              <span className="text-white">Find Your Perfect Tutor<span className="text-[#ff6b9d]">.</span></span>
            </h1>
            <p className="text-xl text-white/90 font-base">
              Connect with verified IB, DSE, SAT, and other tutors from Hong Kong.
              Transparent, verified reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-ocean text-white hover:opacity-90 hover:shadow-xl" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-[hsl(var(--sky))] text-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))] hover:text-white" asChild>
                <Link to="/search">Browse Tutors</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[hsl(var(--foreground))]">Why Choose TUNA?</h2>
          <p className="text-[hsl(var(--muted-foreground))]">
            Trust, transparency, and technology for better tutoring
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--cyan))]/30 hover:border-[hsl(var(--cyan))]/60 hover:shadow-xl transition-all">
            <CardHeader>
              <Shield className="h-10 w-10 text-[hsl(var(--cyan))] mb-2" />
              <CardTitle className="text-[hsl(var(--foreground))]">Verified Tutors</CardTitle>
              <CardDescription>
                All tutors are verified HKU/UST graduates with verified credentials
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--aqua))]/30 hover:border-[hsl(var(--aqua))]/60 hover:shadow-xl transition-all">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-[hsl(var(--teal))] mb-2" />
              <CardTitle className="text-[hsl(var(--foreground))]">Transparent Reputation</CardTitle>
              <CardDescription>
                Verified reputation records that can't be faked or manipulated
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--sky))]/30 hover:border-[hsl(var(--sky))]/60 hover:shadow-xl transition-all">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-[hsl(var(--sky))] mb-2" />
              <CardTitle className="text-[hsl(var(--foreground))]">Easy Payments</CardTitle>
              <CardDescription>
                Pay via FPS or credit card - no crypto knowledge required
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--coral))]/30 hover:border-[hsl(var(--coral))]/60 hover:shadow-xl transition-all">
            <CardHeader>
              <Users className="h-10 w-10 text-[hsl(var(--coral))] mb-2" />
              <CardTitle className="text-[hsl(var(--foreground))]">Learn-to-Earn</CardTitle>
              <CardDescription>
                Earn credits for attending lessons and redeem for discounts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[hsl(var(--foreground))]">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--sky))] to-[hsl(var(--cyan))] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg">
              1
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Find a Tutor</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Browse verified tutors, filter by subject, price, and ratings
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--cyan))] to-[hsl(var(--aqua))] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg">
              2
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Book & Pay</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Schedule a lesson and pay securely via FPS or card
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--aqua))] to-[hsl(var(--teal))] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg">
              3
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Learn & Earn</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Attend your lesson, rate your tutor, and earn credits
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Join hundreds of parents and tutors using TUNA for transparent, verified tutoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="gradient" asChild>
              <Link to="/register">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-[hsl(var(--sky))] text-[hsl(var(--sky))] hover:bg-[hsl(var(--sky))] hover:text-white" asChild>
              <Link to="/search">Browse Tutors</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

