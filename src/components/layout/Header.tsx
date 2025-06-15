
import React from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const navLinks = [
    { to: "/how-it-works", label: "How It Works" },
    { to: "/demo", label: "Demo" },
    { to: "/useful-prompts", label: "Prompts" },
    { to: "/pricing", label: "Pricing" },
    { to: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const AuthButtons: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
    const buttonBaseClasses = isMobile ? "w-full" : "";
    if (session) {
      return (
        <>
          <Button variant="outline" className={buttonBaseClasses} onClick={() => navigate('/dashboard')}>Dashboard</Button>
          <Button className={buttonBaseClasses} onClick={handleLogout}>Logout</Button>
        </>
      );
    }
    return (
      <>
        <Button variant="outline" className={`${buttonBaseClasses} text-brand border-brand hover:bg-brand-light hover:text-brand`} onClick={() => navigate('/auth')}>Login</Button>
        <Button className={`${buttonBaseClasses} bg-brand text-brand-foreground hover:bg-brand/90`} onClick={() => navigate('/auth')}>Sign Up</Button>
      </>
    );
  };

  return (
    <header className="py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-foreground/70 hover:text-brand transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <AuthButtons />
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
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground/70 hover:text-brand transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <AuthButtons isMobile />
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
