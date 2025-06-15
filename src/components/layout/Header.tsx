
import React from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const primaryLinks = [
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
        <nav className="hidden md:flex space-x-2 items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground/70 hover:text-brand bg-transparent hover:bg-accent focus:bg-accent data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 text-sm font-medium">
                  How It Works
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[200px] lg:w-[250px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/how-it-works" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">How It Works</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            A quick overview of our process.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/instructions" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Full Instructions</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            A detailed guide to all features.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {primaryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-foreground/70 hover:text-brand transition-colors px-4 py-2 rounded-md text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center space-x-2">
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
            <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground/70 hover:text-brand transition-colors py-2">How It Works</Link>
            <Link to="/instructions" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground/70 hover:text-brand transition-colors py-2">Full Instructions</Link>
            {primaryLinks.map((link) => (
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
