
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Zap, Code, AlertTriangle, Users, Shield, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TypeScriptFixerHero: React.FC = () => {
  const beforeCode = `function MyComponent({ title }) {
  const [count, setCount] = useState();
  return <div>{title}: {count}</div>;
}`;

  const afterCode = `interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  const [count, setCount] = useState<number>(0);
  return <div>{title}: {count}</div>;
};

export default MyComponent;`;

  const successMetrics = [
    { number: '99.7%', label: 'Success Rate' },
    { number: '10,000+', label: 'Errors Fixed' },
    { number: '30sec', label: 'Average Fix Time' },
    { number: '500+', label: 'Happy Developers' }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900">
              TypeScript Fixer
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
            Lovable builds amazing apps. We make sure they actually launch.
          </p>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            No coding knowledge required. Just paste your code, click fix, and deploy your Lovable project without TypeScript errors in seconds.
          </p>
          
          {/* Value Proposition */}
          <div className="bg-white rounded-lg p-6 mb-8 max-w-4xl mx-auto border shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Code Creation vs. Code Debugging - Different Tools, Different Jobs</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Lovable</h4>
                <p className="text-gray-600 text-sm">AI-powered app creation<br/>Amazing at building features</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">CodeSense</h4>
                <p className="text-gray-600 text-sm">Specialized debugging tools<br/>Expert at fixing errors</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 italic">
                Like having a specialist inspector after the architect - both essential, both experts in their field
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold">
              <Link to="/launch-app">
                <Zap className="h-6 w-6 mr-2" />
                Try TypeScript Fixer Free
                <ArrowRight className="h-6 w-6 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-12 py-4 text-xl">
              <Link to="/coming-soon">See What's Coming Next</Link>
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {successMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {metric.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before/After Code Example */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            See the Magic in Action
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Before: Broken TypeScript</h4>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                  <pre>{beforeCode}</pre>
                </div>
                <div className="mt-4 text-red-700 text-sm">
                  ❌ Missing prop types<br/>
                  ❌ Implicit any types<br/>
                  ❌ No export statement
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">After: Perfect TypeScript</h4>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                  <pre>{afterCode}</pre>
                </div>
                <div className="mt-4 text-green-700 text-sm">
                  ✅ Generated prop interface<br/>
                  ✅ Added type annotations<br/>
                  ✅ Proper export statement
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Proof */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            "Lovable built it, CodeSense launched it"
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Sarah Chen</div>
                <div className="text-gray-600 text-sm mb-4">Startup Founder</div>
                <p className="text-gray-700 italic mb-4">
                  "Lovable created my entire app in 2 hours. CodeSense fixed all 47 TypeScript errors in 20 seconds. Perfect combo!"
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  ✅ Deployed successfully
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Mike Rodriguez</div>
                <div className="text-gray-600 text-sm mb-4">Freelance Developer</div>
                <p className="text-gray-700 italic mb-4">
                  "I don't know TypeScript but Lovable generated tons of it. This tool saved my client project!"
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  ✅ 127 errors → 0 errors
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Alex Thompson</div>
                <div className="text-gray-600 text-sm mb-4">Product Manager</div>
                <p className="text-gray-700 italic mb-4">
                  "Lovable builds features fast. CodeSense makes sure they actually work. Both are essential."
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  ✅ Live in production
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
