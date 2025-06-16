
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ToolIntegrationGuidesProps {
  advancedMode: boolean;
  selectedTools: string[];
}

const integrationGuides = {
  eslint: {
    name: 'ESLint',
    setupSteps: [
      'Install ESLint: npm install --save-dev eslint',
      'Initialize configuration: npx eslint --init',
      'Add scripts to package.json',
      'Configure your IDE for real-time feedback'
    ],
    configExample: `{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "semi": ["error", "always"]
  }
}`,
    cicdIntegration: `# GitHub Actions
- name: Run ESLint
  run: npm run lint`,
    documentation: 'https://eslint.org/docs/user-guide/getting-started',
    difficulty: 'Easy',
    timeToSetup: '15 minutes'
  },
  lighthouse: {
    name: 'Lighthouse',
    setupSteps: [
      'Install Lighthouse CLI: npm install -g lighthouse',
      'Run audit: lighthouse https://your-site.com',
      'Integrate with CI/CD pipeline',
      'Set up automated monitoring'
    ],
    configExample: `{
  "extends": "lighthouse:default",
  "settings": {
    "onlyCategories": ["performance", "accessibility", "seo"]
  }
}`,
    cicdIntegration: `# Lighthouse CI
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9`,
    documentation: 'https://developers.google.com/web/tools/lighthouse',
    difficulty: 'Medium',
    timeToSetup: '30 minutes'
  },
  snyk: {
    name: 'Snyk',
    setupSteps: [
      'Sign up for Snyk account',
      'Install Snyk CLI: npm install -g snyk',
      'Authenticate: snyk auth',
      'Test project: snyk test'
    ],
    configExample: `{
  "language-settings": {
    "javascript": {
      "ignoreDevDeps": true
    }
  },
  "ignore": {
    "SNYK-JS-LODASH-567746": ["*"]
  }
}`,
    cicdIntegration: `# Snyk Security Scan
- name: Run Snyk
  uses: snyk/actions/node@master`,
    documentation: 'https://docs.snyk.io/snyk-cli',
    difficulty: 'Medium',
    timeToSetup: '20 minutes'
  },
  accessibility: {
    name: 'Accessibility Checker',
    setupSteps: [
      'Install axe-core: npm install --save-dev @axe-core/cli',
      'Run accessibility audit: axe https://your-site.com',
      'Integrate with testing framework',
      'Set up automated checks'
    ],
    configExample: `{
  "rules": {
    "color-contrast": { "enabled": true },
    "image-alt": { "enabled": true },
    "keyboard": { "enabled": true }
  }
}`,
    cicdIntegration: `# Accessibility Testing
- name: Run Accessibility Tests
  run: npm run test:a11y`,
    documentation: 'https://www.deque.com/axe/devtools/',
    difficulty: 'Easy',
    timeToSetup: '10 minutes'
  }
};

export const ToolIntegrationGuides = ({ advancedMode, selectedTools }: ToolIntegrationGuidesProps) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
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
        <h3 className="text-lg font-semibold mb-2">Integration & Setup Guides</h3>
        <p className="text-muted-foreground">
          {advancedMode 
            ? 'Complete setup instructions, configuration examples, and CI/CD integration guides'
            : 'Step-by-step instructions to set up these tools in your project'
          }
        </p>
      </div>

      {selectedTools.length > 0 ? (
        <div className="space-y-6">
          {selectedTools.map(toolId => {
            const guide = integrationGuides[toolId as keyof typeof integrationGuides];
            if (!guide) return null;

            return (
              <Card key={toolId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{guide.name} Setup Guide</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {guide.timeToSetup}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="steps" className="w-full">
                    <TabsList>
                      <TabsTrigger value="steps">Setup Steps</TabsTrigger>
                      <TabsTrigger value="config">Configuration</TabsTrigger>
                      {advancedMode && <TabsTrigger value="cicd">CI/CD</TabsTrigger>}
                    </TabsList>
                    
                    <TabsContent value="steps" className="space-y-4">
                      <div className="space-y-3">
                        {guide.setupSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <a href={guide.documentation} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Official Documentation
                          </a>
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="config" className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Configuration Example</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(guide.configExample, `${guide.name} config`)}
                          >
                            {copiedText === `${guide.name} config` ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            {copiedText === `${guide.name} config` ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                          <code>{guide.configExample}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    {advancedMode && (
                      <TabsContent value="cicd" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">CI/CD Integration</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(guide.cicdIntegration, `${guide.name} cicd`)}
                            >
                              {copiedText === `${guide.name} cicd` ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Copy className="h-3 w-3 mr-1" />
                              )}
                              {copiedText === `${guide.name} cicd` ? 'Copied!' : 'Copy'}
                            </Button>
                          </div>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                            <code>{guide.cicdIntegration}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Tools for Setup Guides</h3>
            <p className="text-muted-foreground">
              Choose analysis tools from the Overview tab to see detailed setup instructions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
