
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CollaboratorsListProps {
  collaborators: any[];
}

export const CollaboratorsList = ({ collaborators }: CollaboratorsListProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Collaborators</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {collaborators.map((c: any) => (
        <div key={c.user_id} className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${c.email}`} />
                <AvatarFallback>{c.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{c.email}</TooltipContent>
          </Tooltip>
          <span className="text-sm font-medium">{c.email}</span>
        </div>
      ))}
      {collaborators.length === 0 && <p className="text-sm text-muted-foreground">Just you so far.</p>}
    </CardContent>
  </Card>
);
