
import React from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut } = useAuth();

  const primaryLinks = [
    { to: "/launch-app", label: "TypeScript Fixer" },
    { to: "/coming-soon", label: "Coming Soon" },
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
        <Button variant="outline" className={`${buttonBaseClasses} text-brand border-brand hover:bg-brand-light hover:text-brand`} onClick={() => navigate('/auth')}>Sign In</Button>
        <Button className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white`} onClick={() => navigate('/auth')}>Free Trial</Button>
      </>
    );
  };

  return (
    <header className="py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex space-x-2 items-center">
          {primaryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`transition-colors px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === link.to 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-foreground/70 hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center space-x-2 ml-4">
            <AuthButtons />
          </div>
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
            {primaryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`transition-colors py-2 ${
                  location.pathname === link.to 
                    ? 'text-blue-600 font-medium' 
                    : 'text-foreground/70 hover:text-blue-600'
                }`}
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
