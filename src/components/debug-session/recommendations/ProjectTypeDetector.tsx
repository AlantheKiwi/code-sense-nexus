
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu, Globe, Smartphone, Server } from 'lucide-react';

interface ProjectTypeDetectorProps {
  projectId?: string;
  onContextUpdate: (context: any) => void;
  onApplyRecommendation: (tools: string[]) => void;
}

const projectTypes = {
  react: {
    name: 'React Application',
    icon: Cpu,
    tools: ['eslint', 'lighthouse', 'accessibility'],
    confidence: 95,
    description: 'Modern React application with TypeScript',
    color: 'bg-blue-100 text-blue-800'
  },
  vue: {
    name: 'Vue.js Application',
    icon: Globe,
    tools: ['eslint', 'lighthouse'],
    confidence: 85,
    description: 'Vue.js single-page application',
    color: 'bg-green-100 text-green-800'
  },
  static: {
    name: 'Static Website',
    icon: Globe,
    tools: ['lighthouse', 'accessibility'],
    confidence: 90,
    description: 'Static HTML/CSS/JS website',
    color: 'bg-gray-100 text-gray-800'
  },
  fullstack: {
    name: 'Full-Stack Application',
    icon: Server,
    tools: ['eslint', 'lighthouse', 'snyk', 'accessibility'],
    confidence: 88,
    description: 'Full-stack web application with backend',
    color: 'bg-purple-100 text-purple-800'
  }
};

export const ProjectTypeDetector = ({ projectId, onContextUpdate, onApplyRecommendation }: ProjectTypeDetectorProps) => {
  const [detectedType, setDetectedType] = useState('react');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulate project analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onContextUpdate({
        type: detectedType,
        stage: 'development',
        complexity: 'medium',
        teamSize: 'small'
      });
    }, 1000);
  }, [projectId, detectedType, onContextUpdate]);

  const handleApplyRecommendation = (type: string) => {
    const recommendation = projectTypes[type as keyof typeof projectTypes];
    onApplyRecommendation(recommendation.tools);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Project Analysis</h3>
        {isAnalyzing ? (
          <div className="space-y-2">
            <p className="text-muted-foreground">Analyzing project structure...</p>
            <Progress value={75} className="w-full" />
          </div>
        ) : (
          <p className="text-muted-foreground">Based on your project structure, here are our recommendations</p>
        )}
      </div>

      <div className="grid gap-4">
        {Object.entries(projectTypes).map(([key, type]) => {
          const IconComponent = type.icon;
          const isDetected = key === detectedType;
          
          return (
            <Card key={key} className={`transition-all ${isDetected ? 'border-blue-300 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={type.color}>
                      {type.confidence}% match
                    </Badge>
                    {isDetected && (
                      <Badge variant="default">Detected</Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {type.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant={isDetected ? "default" : "outline"}
                    onClick={() => handleApplyRecommendation(key)}
                  >
                    Apply Tools
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
