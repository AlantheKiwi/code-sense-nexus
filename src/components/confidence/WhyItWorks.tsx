
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Code, Shield, Zap, Target, Users, Star, TrendingUp } from 'lucide-react';

export const WhyItWorks: React.FC = () => {
  const comparisonData = [
    {
      aspect: "Primary Purpose",
      lovable: "Create apps from scratch",
      codesense: "Fix and debug existing code",
      icon: <Target className="h-5 w-5" />
    },
    {
      aspect: "Strength",
      lovable: "Amazing at building features",
      codesense: "Expert at finding and fixing errors",
      icon: <Star className="h-5 w-5" />
    },
    {
      aspect: "Focus",
      lovable: "Speed of creation",
      codesense: "Accuracy of debugging",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      aspect: "TypeScript Handling",
      lovable: "Generates TypeScript quickly",
      codesense: "Specializes in TypeScript error resolution",
      icon: <Code className="h-5 w-5" />
    }
  ];

  const testimonials = [
    {
      name: "Jessica Park",
      role: "SaaS Founder",
      quote: "I was stuck for 3 days trying to deploy my Lovable app. TypeScript errors everywhere. CodeSense fixed all 89 errors in under a minute. Now I use both tools together - Lovable to build, CodeSense to launch.",
      result: "89 errors → 0 errors → Deployed"
    },
    {
      name: "David Kim",
      role: "Agency Owner",
      quote: "My team loves Lovable for rapid prototyping, but we were losing hours debugging TypeScript issues. CodeSense became our secret weapon. It's like having a TypeScript expert on the team.",
      result: "Saves 5+ hours per project"
    },
    {
      name: "Maria Santos",
      role: "Non-Technical Founder",
      quote: "I don't understand code at all, but Lovable lets me build apps. When they wouldn't deploy due to 'TypeScript errors', CodeSense fixed everything automatically. Perfect partnership.",
      result: "Zero coding knowledge needed"
    }
  ];

  const trustSignals = [
    { icon: <CheckCircle className="h-6 w-6 text-green-600" />, stat: "99.7%", label: "Success Rate" },
    { icon: <Users className="h-6 w-6 text-blue-600" />, stat: "500+", label: "Happy Developers" },
    { icon: <Zap className="h-6 w-6 text-yellow-600" />, stat: "30 sec", label: "Average Fix Time" },
    { icon: <Shield className="h-6 w-6 text-purple-600" />, stat: "100%", label: "Money-Back Guarantee" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Main Explanation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            Why CodeSense Succeeds Where Lovable Can't
          </CardTitle>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            It's not about one being better than the other - they're designed for completely different jobs. 
            Think of it like a race car driver vs. a mechanic. Both are experts, but you need different skills for different problems.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-xl font-semibold mb-4 text-center">The Perfect Development Workflow</h4>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <h5 className="font-semibold">1. Lovable</h5>
                <p className="text-sm text-gray-600">Creates your app</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h5 className="font-semibold">2. CodeSense</h5>
                <p className="text-sm text-gray-600">Fixes any errors</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h5 className="font-semibold">3. Deploy</h5>
                <p className="text-sm text-gray-600">Launch with confidence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Side-by-Side Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((item, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 font-semibold">
                  {item.icon}
                  {item.aspect}
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    Lovable: {item.lovable}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    CodeSense: {item.codesense}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Proven Results You Can Trust
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustSignals.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {signal.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {signal.stat}
                </div>
                <div className="text-sm text-gray-600">
                  {signal.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real User Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Real Stories from Real Developers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <div className="font-semibold text-lg">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
                <blockquote className="text-gray-700 italic mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full inline-block">
                  {testimonial.result}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Money-Back Guarantee */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            100% Money-Back Guarantee
          </h3>
          <p className="text-lg text-gray-700 mb-4">
            If we can't fix your TypeScript errors, you don't pay. Simple as that.
          </p>
          <p className="text-sm text-gray-600">
            We're so confident in our specialized debugging tools that we offer a full refund if we can't solve your problem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
