
interface SessionHeaderProps {
  sessionId: string | undefined;
}

export const SessionHeader = ({ sessionId }: SessionHeaderProps) => (
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Live Debugging Session</h1>
    <p className="text-muted-foreground">Session ID: {sessionId}</p>
  </div>
);
