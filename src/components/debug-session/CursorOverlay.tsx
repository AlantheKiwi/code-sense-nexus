
import { MousePointer2 } from 'lucide-react';

interface CursorOverlayProps {
    cursors: { [userId: string]: { x: number, y: number, email: string } };
    currentUserId: string | undefined;
}

export const CursorOverlay = ({ cursors, currentUserId }: CursorOverlayProps) => (
    <>
      {Object.entries(cursors).map(([userId, cursorData]) => {
        if (userId === currentUserId) return null;
        return (
          <div
            key={userId}
            className="absolute flex items-center gap-1 text-white bg-blue-500/80 px-2 py-1 rounded-full pointer-events-none transition-all duration-75 ease-out"
            style={{ left: cursorData.x, top: cursorData.y, zIndex: 50, transform: 'translateY(-100%)' }}
          >
            <MousePointer2 className="h-4 w-4" />
            <span className="text-xs font-medium">{cursorData.email}</span>
          </div>
        );
      })}
    </>
);
