
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save, History, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LegalDocument {
  id: string;
  document_type: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

const LegalPagesManagement = () => {
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin-legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('document_type', { ascending: true })
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as LegalDocument[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ documentType, content }: { documentType: string, content: string }) => {
      // First, set all previous versions to inactive
      await supabase
        .from('legal_documents')
        .update({ is_active: false })
        .eq('document_type', documentType);

      // Get the latest version number
      const { data: latestDoc } = await supabase
        .from('legal_documents')
        .select('version')
        .eq('document_type', documentType)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const newVersion = (latestDoc?.version || 0) + 1;

      // Insert new version
      const { data, error } = await supabase
        .from('legal_documents')
        .insert({
          document_type: documentType,
          content,
          version: newVersion,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Legal document updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-legal-documents'] });
      setEditingDoc(null);
      setEditContent('');
    },
    onError: (error: any) => {
      toast.error(`Failed to update document: ${error.message}`);
    }
  });

  const documentTypes = ['terms', 'privacy', 'refund'];
  
  const getActiveDocument = (type: string) => 
    documents?.find(doc => doc.document_type === type && doc.is_active);

  const getDocumentHistory = (type: string) =>
    documents?.filter(doc => doc.document_type === type) || [];

  const startEditing = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setEditContent(doc.content);
  };

  const saveDocument = () => {
    if (!editingDoc) return;
    updateMutation.mutate({
      documentType: editingDoc.document_type,
      content: editContent
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Legal Pages Management</h1>
        <p className="text-muted-foreground">Manage Terms of Service, Privacy Policy, and other legal documents</p>
      </div>

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="refund">Refund Policy</TabsTrigger>
        </TabsList>

        {documentTypes.map(type => {
          const activeDoc = getActiveDocument(type);
          const history = getDocumentHistory(type);
          const isEditing = editingDoc?.document_type === type;

          return (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {type.charAt(0).toUpperCase() + type.slice(1)} Policy
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {activeDoc && (
                          <Badge>Version {activeDoc.version}</Badge>
                        )}
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={saveDocument}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingDoc(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => activeDoc && startEditing(activeDoc)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[400px] font-mono text-sm"
                          placeholder="Enter legal document content..."
                        />
                      ) : (
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded min-h-[400px]">
                            {activeDoc?.content || 'No content available'}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Version History */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <History className="h-5 w-5 mr-2" />
                        Version History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {history.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 border rounded cursor-pointer hover:bg-muted ${doc.is_active ? 'bg-primary/10 border-primary' : ''}`}
                            onClick={() => startEditing(doc)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Version {doc.version}</span>
                              {doc.is_active && <Badge variant="secondary">Active</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live Preview Link */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`/${type}`} target="_blank" rel="noopener noreferrer">
                          View Live Page
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default LegalPagesManagement;
