
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Plus, CheckCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue } from './ResultsSummaryDashboard';

interface ProjectManagementIntegrationProps {
  issues: Issue[];
  projectId: string;
}

interface IntegrationConfig {
  platform: 'jira' | 'github' | 'linear' | 'asana' | 'trello';
  apiKey: string;
  projectKey: string;
  isConnected: boolean;
}

export const ProjectManagementIntegration = ({ issues, projectId }: ProjectManagementIntegrationProps) => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    { platform: 'jira', apiKey: '', projectKey: '', isConnected: false },
    { platform: 'github', apiKey: '', projectKey: '', isConnected: true },
    { platform: 'linear', apiKey: '', projectKey: '', isConnected: false },
  ]);

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [taskTemplate, setTaskTemplate] = useState({
    assignee: '',
    labels: [] as string[],
    priority: 'medium',
    dueDate: '',
  });

  const handleConnect = (platform: string, apiKey: string, projectKey: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.platform === platform 
        ? { ...integration, apiKey, projectKey, isConnected: true }
        : integration
    ));
    toast.success(`Connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
  };

  const handleCreateTasks = async () => {
    if (selectedIssues.length === 0) {
      toast.error('Please select at least one issue to create tasks for');
      return;
    }

    const connectedIntegration = integrations.find(i => i.isConnected);
    if (!connectedIntegration) {
      toast.error('Please connect to a project management platform first');
      return;
    }

    // Mock task creation - in real implementation, this would call the actual APIs
    const selectedIssueData = issues.filter(issue => selectedIssues.includes(issue.id));
    
    toast.success(`Created ${selectedIssueData.length} tasks in ${connectedIntegration.platform}`);
    
    // Reset selection
    setSelectedIssues([]);
  };

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const getPlatformIcon = (platform: string) => {
    // In a real implementation, these would be actual platform icons
    return <ExternalLink className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create-tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-tasks">Create Tasks</TabsTrigger>
          <TabsTrigger value="integrations">Manage Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="create-tasks" className="space-y-4">
          {/* Issue Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Issues to Create Tasks</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIssues(issues.map(i => i.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIssues([])}
                  >
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedIssues.includes(issue.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleIssueSelection(issue.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedIssues.includes(issue.id)}
                            onChange={() => toggleIssueSelection(issue.id)}
                            className="rounded"
                          />
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge variant={issue.severity === 'critical' ? 'destructive' : 'outline'}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-4 ml-6 mt-2 text-sm text-muted-foreground">
                          <span>Est. {issue.estimatedTimeHours}h</span>
                          <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Task Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">Default Assignee</Label>
                  <Input
                    id="assignee"
                    placeholder="Enter username or email"
                    value={taskTemplate.assignee}
                    onChange={(e) => setTaskTemplate(prev => ({ ...prev, assignee: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Default Priority</Label>
                  <Select 
                    value={taskTemplate.priority} 
                    onValueChange={(value) => setTaskTemplate(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due-date">Default Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={taskTemplate.dueDate}
                    onChange={(e) => setTaskTemplate(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="labels">Labels (comma-separated)</Label>
                  <Input
                    id="labels"
                    placeholder="bug, technical-debt, security"
                    onChange={(e) => setTaskTemplate(prev => ({ 
                      ...prev, 
                      labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
                </div>
                <Button onClick={handleCreateTasks} disabled={selectedIssues.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {selectedIssues.length} Task{selectedIssues.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.platform}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(integration.platform)}
                      <div>
                        <h4 className="font-medium capitalize">{integration.platform}</h4>
                        <p className="text-sm text-muted-foreground">
                          {integration.isConnected ? `Connected to ${integration.projectKey}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.isConnected ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        {integration.isConnected ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jira">Jira</SelectItem>
                      <SelectItem value="github">GitHub Issues</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="asana">Asana</SelectItem>
                      <SelectItem value="trello">Trello</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="api-key">API Key / Token</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key or personal access token"
                  />
                </div>
                <div>
                  <Label htmlFor="project-key">Project Key / Repository</Label>
                  <Input
                    id="project-key"
                    placeholder="e.g., PROJ-123 or owner/repo"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Integration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Automatic Task Creation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Convert analysis results to actionable tasks</li>
                    <li>• Maintain context and technical details</li>
                    <li>• Assign appropriate labels and priorities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Team Collaboration</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Automatic assignee suggestions</li>
                    <li>• Progress tracking and updates</li>
                    <li>• Integration with existing workflows</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
