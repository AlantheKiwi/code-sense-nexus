
import { useState, useRef, useCallback } from 'react';

export const useDebugSessionCursor = () => {
  const [cursors, setCursors] = useState<{ [userId: string]: { x: number, y: number, email: string } }>({});
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent, broadcastEvent: (event: any) => void) => {
    if (throttleTimeoutRef.current) {
      return;
    }
    broadcastEvent({
      type: 'CURSOR_UPDATE',
      payload: { x: e.clientX, y: e.clientY },
    });
    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, 50);
  }, []);

  const updateCursor = useCallback((userId: string, cursorData: { x: number, y: number, email: string }) => {
    setCursors(prev => ({
      ...prev,
      [userId]: cursorData
    }));
  }, []);

  const cleanupCursors = useCallback((activeCollaboratorIds: Set<string>) => {
    setCursors(currentCursors => {
      const newCursors: { [userId: string]: { x: number, y: number, email: string } } = {};
      Object.keys(currentCursors).forEach(userId => {
        if (activeCollaboratorIds.has(userId)) {
          newCursors[userId] = currentCursors[userId];
        }
      });
      return newCursors;
    });
  }, []);

  return {
    cursors,
    handleMouseMove,
    updateCursor,
    cleanupCursors
  };
};
