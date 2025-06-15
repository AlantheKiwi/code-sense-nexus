
import React from 'react';
import { Zap } from 'lucide-react'; // Example icon

const Logo = () => {
  return (
    <a href="/" className="flex items-center space-x-2 text-2xl font-bold text-brand">
      <Zap className="h-7 w-7 text-brand" />
      <span>CodeSense</span>
    </a>
  );
};

export default Logo;
