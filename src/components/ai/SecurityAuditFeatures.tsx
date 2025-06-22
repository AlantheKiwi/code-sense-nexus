
import React from 'react';
import { Shield, Target, Brain, CheckCircle, Zap, Clock } from 'lucide-react';

export const SecurityAuditFeatures: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-red-200">
      <h4 className="font-semibold text-red-800 mb-3">Professional Security Audit Includes:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-red-500" />
          Vulnerability Detection
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-3 w-3 text-red-500" />
          OWASP Top 10 Analysis
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-3 w-3 text-red-500" />
          Multi-AI Validation
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-red-500" />
          Compliance Assessment
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-red-500" />
          Code Fix Examples
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-red-500" />
          Executive Summary
        </div>
      </div>
    </div>
  );
};
