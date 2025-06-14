
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
    const containerClasses = isMobile ? "flex flex-col space-y-2" : "nav-buttons";

    if (session) {
      return (
        <div className={containerClasses}>
          <Button variant="outline" className={buttonBaseClasses} onClick={() => navigate('/dashboard')}>Dashboard</Button>
          <Button className={`${buttonBaseClasses} btn-login`} onClick={handleLogout}>Logout</Button>
        </div>
      );
    }
    return (
      <div className={containerClasses}>
        <Button variant="outline" className={`${buttonBaseClasses} btn-login`} onClick={() => navigate('/auth')}>Login</Button>
        <Button className={`${buttonBaseClasses} btn-signup`} onClick={() => navigate('/auth')}>Sign Up</Button>
      </div>
    );
  };

  return (
    <header className="navbar">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="nav-container">
        <Logo />
        <div role="navigation" className="nav-links hidden md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
          <AuthButtons />
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open main menu</span>
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b pb-4">
          <div role="navigation" className="container mx-auto px-4 flex flex-col space-y-3 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="nav-link text-center py-2"
              >
                {link.label}
              </Link>
            ))}
            <AuthButtons isMobile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
