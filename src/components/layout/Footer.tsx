
import React from 'react';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const primaryLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Demo', href: '/demo' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Useful Prompts', href: '/useful-prompts' },
  ];

  const resourceLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Success Stats', href: '/stats' },
    { name: 'Best Practices', href: '/best-practices' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="py-12 border-t bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Debugging for the No-Code Era.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Platform</h4>
                <ul className="space-y-1">
                  {primaryLinks.map(link => (
                    <li key={link.name}><Link to={link.href} className="text-muted-foreground hover:text-brand">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Company</h4>
                <ul className="space-y-1">
                  {companyLinks.map(link => (
                    <li key={link.name}><Link to={link.href} className="text-muted-foreground hover:text-brand">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resources</h4>
                <ul className="space-y-1">
                  {resourceLinks.map(link => (
                    <li key={link.name}><Link to={link.href} className="text-muted-foreground hover:text-brand">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {currentYear} CodeSense. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
