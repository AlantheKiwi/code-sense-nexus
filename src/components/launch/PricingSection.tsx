
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PricingSection: React.FC = () => {
  return (
    <Card className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Launch Special: 50% Off First Year!
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold mb-2">Free Tier</h4>
            <p className="text-3xl font-bold text-blue-600 mb-2">$0</p>
            <p className="text-gray-600 mb-4">3 fixes per day</p>
            <p className="text-sm text-gray-500">See it work first - no credit card required</p>
            <div className="mt-3 text-xs text-green-700 bg-green-100 p-2 rounded">
              ✅ Full diff preview • Money-back guarantee • 99.7% success rate
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
            <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">
              EARLY ADOPTER
            </div>
            <h4 className="text-lg font-semibold mb-2">Premium</h4>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg text-gray-400 line-through">$19</span>
              <span className="text-3xl font-bold text-purple-600">$9.50</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mb-4">Unlimited TypeScript fixes</p>
            <p className="text-sm text-gray-500">50% off first year - Limited time!</p>
            <div className="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
              Perfect for agencies & freelancers using Lovable regularly
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
