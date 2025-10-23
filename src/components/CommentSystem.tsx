import { useState, useEffect, useRef } from "react";
import { CommentMarker } from "./CommentMarker";
import { CommentThread } from "./CommentThread";
import { Comment, CommentThread as CommentThreadType } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface CommentSystemProps {
  enabled?: boolean;
}

export const CommentSystem = ({ enabled = true }: CommentSystemProps) => {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [threads, setThreads] = useState<CommentThreadType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Só permite comentário em áreas válidas (não em modais, dialogs, etc)
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('.comment-thread')) {
        return;
      }

      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left + window.scrollX;
      const y = e.clientY - rect.top + window.scrollY;

      // Criar novo thread
      const newThreadId = `thread-${Date.now()}`;
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        thread_id: newThreadId,
        author: currentUser.name,
        content: "",
        created_at: new Date().toISOString(),
      };

      const newThread: CommentThreadType = {
        id: newThreadId,
        x,
        y,
        comments: [newComment],
      };

      setThreads((prev) => [...prev, newThread]);
      setActiveThreadId(newThreadId);

      toast({
        title: "Comentário criado",
        description: "Adicione seu comentário",
      });
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [enabled, currentUser, toast]);

  const handleAddComment = (threadId: string, content: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            thread_id: threadId,
            author: currentUser.name,
            content,
            created_at: new Date().toISOString(),
          };
          return {
            ...thread,
            comments: [...thread.comments, newComment],
          };
        }
        return thread;
      })
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  };

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
      {threads.map((thread) => {
        // Não mostrar marcador se o thread não tiver conteúdo ainda
        const hasContent = thread.comments.some((c) => c.content.trim());
        if (!hasContent && activeThreadId !== thread.id) {
          return null;
        }

        return (
          <div key={thread.id} className="pointer-events-auto">
            <CommentMarker
              x={thread.x}
              y={thread.y}
              count={thread.comments.filter((c) => c.content.trim()).length}
              isActive={activeThreadId === thread.id}
              onClick={() => setActiveThreadId(thread.id)}
            />
          </div>
        );
      })}

      {activeThreadId && threads.find((t) => t.id === activeThreadId) && (
        <div className="pointer-events-auto comment-thread">
          <CommentThread
            x={threads.find((t) => t.id === activeThreadId)!.x}
            y={threads.find((t) => t.id === activeThreadId)!.y}
            comments={threads.find((t) => t.id === activeThreadId)!.comments}
            onClose={() => {
              const thread = threads.find((t) => t.id === activeThreadId);
              const hasContent = thread?.comments.some((c) => c.content.trim());
              if (!hasContent) {
                handleDeleteThread(activeThreadId);
              }
              setActiveThreadId(null);
            }}
            onAddComment={(content) => handleAddComment(activeThreadId, content)}
          />
        </div>
      )}
    </div>
  );
};
