
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bookmark, Plus, Edit, Trash2, Play } from 'lucide-react';

interface CustomAnalysisProfilesProps {
  projectId?: string;
  selectedTools: string[];
  onApplyRecommendation: (tools: string[]) => void;
}

const savedProfiles = {
  'daily-dev': {
    name: 'Daily Development',
    tools: ['eslint'],
    description: 'Quick checks during active development',
    lastUsed: '2 hours ago',
    useCount: 47,
    isDefault: false
  },
  'pre-commit': {
    name: 'Pre-Commit Check',
    tools: ['eslint', 'accessibility'],
    description: 'Comprehensive check before committing code',
    lastUsed: '1 day ago',
    useCount: 23,
    isDefault: true
  },
  'release-ready': {
    name: 'Release Ready',
    tools: ['eslint', 'lighthouse', 'snyk', 'accessibility'],
    description: 'Full audit before production release',
    lastUsed: '1 week ago',
    useCount: 8,
    isDefault: false
  }
};

export const CustomAnalysisProfiles = ({ 
  projectId, 
  selectedTools, 
  onApplyRecommendation 
}: CustomAnalysisProfilesProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleCreateProfile = () => {
    if (newProfileName.trim() && selectedTools.length > 0) {
      // In a real app, this would save to the backend
      console.log('Creating profile:', newProfileName, selectedTools);
      setNewProfileName('');
      setIsCreating(false);
    }
  };

  const handleDeleteProfile = (profileKey: string) => {
    // In a real app, this would delete from the backend
    console.log('Deleting profile:', profileKey);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Custom Analysis Profiles</h3>
        <p className="text-muted-foreground">
          Save and reuse your favorite tool combinations
        </p>
      </div>

      {/* Create New Profile */}
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          {!isCreating ? (
            <Button
              variant="ghost"
              onClick={() => setIsCreating(true)}
              className="w-full h-auto py-4 flex flex-col gap-2"
            >
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Create New Profile
              </span>
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Input
                  placeholder="Profile name (e.g., 'My Daily Check')"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Current tools will be saved:
                </p>
                <div className="flex gap-1 flex-wrap">
                  {selectedTools.length > 0 ? (
                    selectedTools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tools selected</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim() || selectedTools.length === 0}
                >
                  Save Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewProfileName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Profiles */}
      <div className="grid gap-4">
        {Object.entries(savedProfiles).map(([key, profile]) => (
          <Card key={key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{profile.name}</h4>
                      {profile.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used {profile.useCount} times • Last: {profile.lastUsed}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProfile(key)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {profile.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex gap-1">
                  {profile.tools.map(tool => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onApplyRecommendation(profile.tools)}
                className="w-full flex items-center gap-2"
              >
                <Play className="h-3 w-3" />
                Run Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(savedProfiles).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Saved Profiles</h3>
            <p className="text-muted-foreground">
              Create your first analysis profile to quickly reuse your favorite tool combinations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
