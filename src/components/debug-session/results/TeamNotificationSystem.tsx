
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, MessageSquare, Send, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AnalysisResults } from './ResultsSummaryDashboard';

interface TeamNotificationSystemProps {
  results: AnalysisResults;
  projectId: string;
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'discord';
  name: string;
  webhook?: string;
  enabled: boolean;
  recipients?: string[];
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  includeMetrics: boolean;
  includeCriticalIssues: boolean;
  includeQuickWins: boolean;
}

export const TeamNotificationSystem = ({ results, projectId }: TeamNotificationSystemProps) => {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { type: 'email', name: 'Email', enabled: true, recipients: ['team@company.com'] },
    { type: 'slack', name: 'Slack', enabled: false, webhook: '' },
    { type: 'teams', name: 'Microsoft Teams', enabled: false, webhook: '' },
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'executive',
      name: 'Executive Summary',
      subject: 'Project Health Report - {{projectName}}',
      content: 'Executive summary with key metrics and critical issues.',
      includeMetrics: true,
      includeCriticalIssues: true,
      includeQuickWins: false,
    },
    {
      id: 'developer',
      name: 'Developer Report',
      subject: 'Code Analysis Results - {{projectName}}',
      content: 'Detailed technical report with all issues and recommendations.',
      includeMetrics: true,
      includeCriticalIssues: true,
      includeQuickWins: true,
    },
  ]);

  const [customMessage, setCustomMessage] = useState({
    subject: '',
    content: '',
    recipients: [] as string[],
    channels: [] as string[],
  });

  const handleSendNotification = async (templateId?: string) => {
    const template = templates.find(t => t.id === templateId);
    const enabledChannels = channels.filter(c => c.enabled);
    
    if (enabledChannels.length === 0) {
      toast.error('Please enable at least one notification channel');
      return;
    }

    // Mock notification sending - in real implementation, this would call actual APIs
    const notificationData = {
      template: template?.name || 'Custom Message',
      channels: enabledChannels.map(c => c.name),
      recipients: enabledChannels.reduce((acc, c) => acc + (c.recipients?.length || 1), 0),
    };

    toast.success(`Sent ${notificationData.template} to ${notificationData.recipients} recipients via ${notificationData.channels.join(', ')}`);
  };

  const generateNotificationPreview = (template: NotificationTemplate) => {
    const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
    const quickWins = results.issues.filter(issue => issue.quickWin);

    let content = `# Analysis Results for Project\n\n`;
    
    if (template.includeMetrics) {
      content += `## Project Health: ${results.overallHealthScore}%\n`;
      content += `- Code Quality: ${results.metrics.codeQualityScore}%\n`;
      content += `- Security: ${results.metrics.securityScore}%\n`;
      content += `- Performance: ${results.metrics.performanceScore}%\n`;
      content += `- Accessibility: ${results.metrics.accessibilityScore}%\n\n`;
    }

    if (template.includeCriticalIssues && criticalIssues.length > 0) {
      content += `## Critical Issues (${criticalIssues.length})\n`;
      criticalIssues.forEach(issue => {
        content += `- ${issue.title}: ${issue.description}\n`;
      });
      content += '\n';
    }

    if (template.includeQuickWins && quickWins.length > 0) {
      content += `## Quick Wins Available (${quickWins.length})\n`;
      quickWins.forEach(issue => {
        content += `- ${issue.title} (${issue.estimatedTimeHours}h effort)\n`;
      });
    }

    return content;
  };

  const updateChannel = (type: string, updates: Partial<NotificationChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.type === type ? { ...channel, ...updates } : channel
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          {/* Quick Send Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Send Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendNotification(template.id)}
                        >
                          Send
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.includeMetrics && (
                            <Badge variant="outline" className="text-xs">Metrics</Badge>
                          )}
                          {template.includeCriticalIssues && (
                            <Badge variant="outline" className="text-xs">Critical Issues</Badge>
                          )}
                          {template.includeQuickWins && (
                            <Badge variant="outline" className="text-xs">Quick Wins</Badge>
                          )}
                        </div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Preview</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                            {generateNotificationPreview(template)}
                          </pre>
                        </details>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <CardTitle>Send Custom Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-subject">Subject</Label>
                  <Input
                    id="custom-subject"
                    placeholder="Enter notification subject"
                    value={customMessage.subject}
                    onChange={(e) => setCustomMessage(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-content">Message</Label>
                  <Textarea
                    id="custom-content"
                    placeholder="Enter your custom message..."
                    rows={6}
                    value={customMessage.content}
                    onChange={(e) => setCustomMessage(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Will be sent to {channels.filter(c => c.enabled).length} enabled channel{channels.filter(c => c.enabled).length !== 1 ? 's' : ''}
                  </div>
                  <Button onClick={() => handleSendNotification()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Custom Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {/* Channel Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => (
                  <Card key={channel.type} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {channel.type === 'email' && <Mail className="h-5 w-5" />}
                          {channel.type === 'slack' && <MessageSquare className="h-5 w-5" />}
                          {channel.type === 'teams' && <Users className="h-5 w-5" />}
                          <div>
                            <h4 className="font-medium">{channel.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {channel.enabled ? 'Active' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={(enabled) => updateChannel(channel.type, { enabled })}
                        />
                      </div>

                      {channel.enabled && (
                        <div className="space-y-3">
                          {channel.type === 'email' ? (
                            <div>
                              <Label>Recipients (comma-separated)</Label>
                              <Input
                                placeholder="email1@company.com, email2@company.com"
                                value={channel.recipients?.join(', ') || ''}
                                onChange={(e) => updateChannel(channel.type, {
                                  recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                              />
                            </div>
                          ) : (
                            <div>
                              <Label>Webhook URL</Label>
                              <Input
                                placeholder={`Enter ${channel.name} webhook URL`}
                                value={channel.webhook || ''}
                                onChange={(e) => updateChannel(channel.type, { webhook: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Send a test notification to verify your channel configurations</p>
                </div>
                <Button variant="outline">
                  Send Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Template Management */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Duplicate</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">{template.content}</p>
                        <div className="flex gap-2">
                          {template.includeMetrics && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Metrics
                            </Badge>
                          )}
                          {template.includeCriticalIssues && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Critical Issues
                            </Badge>
                          )}
                          {template.includeQuickWins && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Quick Wins
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create New Template */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input id="template-name" placeholder="Enter template name" />
                </div>
                <div>
                  <Label htmlFor="template-subject">Subject</Label>
                  <Input id="template-subject" placeholder="Enter subject line" />
                </div>
                <div>
                  <Label htmlFor="template-content">Content</Label>
                  <Textarea id="template-content" placeholder="Enter template content" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Include Sections</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="include-metrics" />
                      <Label htmlFor="include-metrics">Project Metrics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-critical" />
                      <Label htmlFor="include-critical">Critical Issues</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-wins" />
                      <Label htmlFor="include-wins">Quick Wins</Label>
                    </div>
                  </div>
                </div>
                <Button>Create Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
