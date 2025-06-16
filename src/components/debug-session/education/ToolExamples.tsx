
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ToolExamplesProps {
  advancedMode: boolean;
  selectedTools: string[];
}

const exampleData = {
  eslint: {
    name: 'ESLint',
    examples: [
      {
        title: 'Unused Variable',
        severity: 'warning',
        difficulty: 'Easy',
        timeToFix: '1 min',
        before: `const unusedVar = "I'm not being used";
console.log("Hello World");`,
        after: `console.log("Hello World");`,
        explanation: 'Removes unused variables that clutter code and may cause confusion.',
        businessImpact: 'Cleaner code, easier maintenance'
      },
      {
        title: 'Missing Semicolons',
        severity: 'warning',
        difficulty: 'Easy',
        timeToFix: '30 sec',
        before: `const name = "John"
const age = 25`,
        after: `const name = "John";
const age = 25;`,
        explanation: 'Adds missing semicolons to prevent potential parsing issues.',
        businessImpact: 'Prevents unexpected behavior, improves consistency'
      },
      {
        title: 'Undefined Variable',
        severity: 'error',
        difficulty: 'Medium',
        timeToFix: '5 min',
        before: `function greet() {
  console.log(userName); // userName is not defined
}`,
        after: `function greet(userName) {
  console.log(userName);
}`,
        explanation: 'Catches references to undefined variables that would cause runtime errors.',
        businessImpact: 'Prevents crashes, improves reliability'
      }
    ]
  },
  lighthouse: {
    name: 'Lighthouse',
    examples: [
      {
        title: 'Large Images',
        severity: 'warning',
        difficulty: 'Easy',
        timeToFix: '10 min',
        before: `<img src="large-photo.jpg" alt="Photo" />
// 5MB image file`,
        after: `<img src="optimized-photo.webp" alt="Photo" />
// 200KB optimized image`,
        explanation: 'Identifies oversized images that slow down page loading.',
        businessImpact: 'Faster loading = higher conversion rates'
      },
      {
        title: 'Missing Alt Text',
        severity: 'error',
        difficulty: 'Easy',
        timeToFix: '2 min',
        before: `<img src="product.jpg" />`,
        after: `<img src="product.jpg" alt="Premium laptop computer" />`,
        explanation: 'Ensures images have descriptive alt text for accessibility and SEO.',
        businessImpact: 'Better SEO ranking, accessible to all users'
      },
      {
        title: 'Render-Blocking Resources',
        severity: 'warning',
        difficulty: 'Medium',
        timeToFix: '20 min',
        before: `<script src="analytics.js"></script>
<link rel="stylesheet" href="styles.css">`,
        after: `<script src="analytics.js" async></script>
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">`,
        explanation: 'Optimizes resource loading to prevent blocking page rendering.',
        businessImpact: 'Faster perceived loading, better user experience'
      }
    ]
  },
  snyk: {
    name: 'Snyk',
    examples: [
      {
        title: 'Vulnerable Dependency',
        severity: 'error',
        difficulty: 'Easy',
        timeToFix: '5 min',
        before: `"lodash": "4.17.11"
// Contains prototype pollution vulnerability`,
        after: `"lodash": "4.17.21"
// Updated to secure version`,
        explanation: 'Identifies and fixes known security vulnerabilities in dependencies.',
        businessImpact: 'Prevents data breaches, maintains user trust'
      },
      {
        title: 'Hardcoded Secret',
        severity: 'error',
        difficulty: 'Medium',
        timeToFix: '15 min',
        before: `const apiKey = "sk-1234567890abcdef";
fetch(\`/api/data?key=\${apiKey}\`);`,
        after: `const apiKey = process.env.API_KEY;
fetch(\`/api/data?key=\${apiKey}\`);`,
        explanation: 'Detects hardcoded secrets that could be exposed in version control.',
        businessImpact: 'Protects sensitive data, prevents unauthorized access'
      }
    ]
  },
  accessibility: {
    name: 'Accessibility Checker',
    examples: [
      {
        title: 'Low Color Contrast',
        severity: 'warning',
        difficulty: 'Easy',
        timeToFix: '3 min',
        before: `color: #999999; /* Light gray on white */
background: #ffffff;`,
        after: `color: #666666; /* Darker gray for better contrast */
background: #ffffff;`,
        explanation: 'Ensures text has sufficient contrast for users with visual impairments.',
        businessImpact: 'Readable by everyone, legal compliance'
      },
      {
        title: 'Missing Form Labels',
        severity: 'error',
        difficulty: 'Easy',
        timeToFix: '2 min',
        before: `<input type="email" placeholder="Email" />`,
        after: `<label for="email">Email Address</label>
<input type="email" id="email" placeholder="Email" />`,
        explanation: 'Provides proper labels for form inputs to work with screen readers.',
        businessImpact: 'Accessible forms, better user experience'
      }
    ]
  }
};

export const ToolExamples = ({ advancedMode, selectedTools }: ToolExamplesProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Real-World Examples</h3>
        <p className="text-muted-foreground">
          {advancedMode 
            ? 'Detailed code examples showing typical issues found and their solutions'
            : 'See the types of problems each tool finds and how to fix them'
          }
        </p>
      </div>

      {selectedTools.length > 0 ? (
        <div className="space-y-6">
          {selectedTools.map(toolId => {
            const tool = exampleData[toolId as keyof typeof exampleData];
            if (!tool) return null;

            return (
              <Card key={toolId}>
                <CardHeader>
                  <CardTitle>{tool.name} Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {tool.examples.map((example, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{example.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={getSeverityColor(example.severity)}>
                              {example.severity}
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(example.difficulty)}>
                              {example.difficulty}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {example.timeToFix}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{example.explanation}</p>

                        {advancedMode && (
                          <Tabs defaultValue="before" className="w-full">
                            <TabsList>
                              <TabsTrigger value="before" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Before
                              </TabsTrigger>
                              <TabsTrigger value="after" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                After
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="before">
                              <pre className="bg-red-50 p-3 rounded text-sm overflow-x-auto">
                                <code>{example.before}</code>
                              </pre>
                            </TabsContent>
                            <TabsContent value="after">
                              <pre className="bg-green-50 p-3 rounded text-sm overflow-x-auto">
                                <code>{example.after}</code>
                              </pre>
                            </TabsContent>
                          </Tabs>
                        )}

                        <div className="bg-blue-50 p-3 rounded">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Business Impact</h5>
                          <p className="text-sm text-blue-800">{example.businessImpact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Tools to See Examples</h3>
            <p className="text-muted-foreground">
              Choose analysis tools from the Overview tab to see real examples of issues they find.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
