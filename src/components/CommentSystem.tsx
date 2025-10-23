import { useState, useEffect, useRef } from "react";
import { CommentMarker } from "./CommentMarker";
import { CommentThread } from "./CommentThread";
import { Comment, CommentThread as CommentThreadType } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { commentService } from "@/lib/comments";
import { testSupabaseConnection } from "@/lib/test-supabase";

interface CommentSystemProps {
  enabled?: boolean;
}

export const CommentSystem = ({ enabled = true }: CommentSystemProps) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<CommentThreadType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Test Supabase connection on mount
    testSupabaseConnection().then(success => {
      console.log('Supabase test result:', success);
    });

    const handleContextMenu = (e: MouseEvent) => {
      // Só permite comentário em áreas válidas (não em modais, dialogs, etc)
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('.comment-thread')) {
        return;
      }

      // Allow right-click with Ctrl key to open browser context menu
      if (e.ctrlKey) {
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
        author: "",
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
        description: "Selecione o responsável e adicione seu comentário",
      });
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [enabled, toast]);

  const handleAddComment = async (threadId: string, content: string, responsavel: string) => {
    console.log('handleAddComment called with:', { threadId, content, responsavel });

    try {
      const savedComment = await commentService.createComment({
        comentario: content,
        responsavel,
        thread: threadId,
      });

      console.log('Result from commentService.createComment:', savedComment);

      if (savedComment) {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === threadId) {
              const newComment: Comment = {
                id: savedComment.id.toString(),
                thread_id: threadId,
                author: responsavel,
                content,
                created_at: savedComment.created_at,
              };
              return {
                ...thread,
                comments: [...thread.comments, newComment],
              };
            }
            return thread;
          })
        );

        toast({
          title: "Comentário salvo",
          description: "Seu comentário foi salvo no Supabase",
        });
      } else {
        toast({
          title: "Erro ao salvar comentário",
          description: "Não foi possível salvar o comentário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      toast({
        title: "Erro ao salvar comentário",
        description: "Não foi possível salvar o comentário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await commentService.deleteComment(parseInt(commentId));

      if (success) {
        setThreads((prev) =>
          prev.map((thread) => ({
            ...thread,
            comments: thread.comments.filter((comment) => comment.id !== commentId),
          }))
        );

        toast({
          title: "Comentário deletado",
          description: "O comentário foi removido com sucesso",
        });
      } else {
        toast({
          title: "Erro ao deletar comentário",
          description: "Não foi possível deletar o comentário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erro ao deletar comentário",
        description: "Não foi possível deletar o comentário",
        variant: "destructive",
      });
    }
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
            onAddComment={(content, responsavel) => handleAddComment(activeThreadId, content, responsavel)}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      )}
    </div>
  );
};
