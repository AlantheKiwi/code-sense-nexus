
import React from 'react';
import { Zap } from 'lucide-react'; // Example icon

const Logo = () => {
  return (
    <a href="/" className="logo flex items-center space-x-2">
      <Zap className="h-7 w-7" />
      <span>CodeSense</span>
    </a>
  );
};

export default Logo;
