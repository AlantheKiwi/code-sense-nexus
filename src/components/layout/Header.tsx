
import React from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button is available
import { Menu } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-foreground/70 hover:text-brand transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="outline" className="text-brand border-brand hover:bg-brand-light hover:text-brand">Login</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90">Sign Up</Button>
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b pb-4">
          <nav className="container mx-auto px-4 flex flex-col space-y-3 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground/70 hover:text-brand transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <Button variant="outline" className="w-full text-brand border-brand hover:bg-brand-light hover:text-brand">Login</Button>
            <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90">Sign Up</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
