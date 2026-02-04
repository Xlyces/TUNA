import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">TUNA</h3>
            <p className="text-sm text-muted-foreground">
              Web3 tutoring platform connecting verified HKU/UST tutors with
              parents.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">For Parents</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/search" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">For Tutors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tutor/verify" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link to="/tutor/benefits" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Benefits
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors duration-150 hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TUNA Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

