
import React from 'react';
import Logo from '@/components/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-12 border-t bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Debugging for the No-Code Era.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Product</h4>
                <ul className="space-y-1">
                  <li><a href="#features" className="text-muted-foreground hover:text-brand">Features</a></li>
                  <li><a href="#pricing" className="text-muted-foreground hover:text-brand">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Company</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="text-muted-foreground hover:text-brand">About Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Careers</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resources</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Documentation</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Legal</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-brand">Terms of Service</a></li>
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
