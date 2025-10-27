import { useState, useEffect, useRef } from "react";
import { CommentMarker } from "./CommentMarker";
import { CommentThread } from "./CommentThread";
import { Comment, CommentThread as CommentThreadType } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { commentService } from "@/lib/comments";

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

    // Load comments for current page only
    const loadExistingComments = async () => {
      try {
        const currentPage = window.location.pathname;

        // Try to get comments by page, fallback to filtering all comments
        let pageComments;
        try {
          pageComments = await commentService.getCommentsByPage(currentPage);
        } catch (error) {
          // If getCommentsByPage fails, get all and filter locally
          const allComments = await commentService.getAllComments();
          pageComments = allComments.filter(comment => {
            const commentPage = comment.pagina || '/';
            return commentPage === currentPage;
          });
        }

        if (pageComments.length === 0) {
          return;
        }

        // Group comments by thread
        const threadMap = new Map<string, CommentThreadType>();

        pageComments.forEach(comment => {
          if (!comment.thread) return;

          if (!threadMap.has(comment.thread)) {
            threadMap.set(comment.thread, {
              id: comment.thread,
              x: comment.position_x || 100,
              y: comment.position_y || 100,
              comments: []
            });
          }

          const thread = threadMap.get(comment.thread)!;
          thread.comments.push({
            id: comment.id.toString(),
            thread_id: comment.thread,
            author: comment.responsavel || 'Unknown',
            content: comment.comentario || '',
            created_at: comment.created_at
          });
        });

        // Set all threads found in database
        setThreads(Array.from(threadMap.values()));

      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadExistingComments();

    // Listen for URL changes to reload comments for new page
    const handleUrlChange = () => {
      setThreads([]);
      setActiveThreadId(null);
      loadExistingComments();
    };

    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', handleUrlChange);

    // Listen for programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(handleUrlChange, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(handleUrlChange, 0);
    };

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

      // Get absolute position on the page
      const x = Math.round(e.pageX);
      const y = Math.round(e.pageY);

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

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [enabled, toast]);

  const handleAddComment = async (threadId: string, content: string, responsavel: string) => {
    try {
      // Get thread position for saving
      const currentThread = threads.find(t => t.id === threadId);

      const savedComment = await commentService.createComment({
        comentario: content,
        responsavel,
        thread: threadId,
        position_x: Math.round(currentThread?.x || 100),
        position_y: Math.round(currentThread?.y || 100),
        pagina: window.location.pathname,
      });

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
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
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
