import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Send } from "lucide-react";
import { Comment } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const RESPONSAVEIS = ["Swellen", "João", "Leo", "Hemmely"];

interface CommentThreadProps {
  x: number;
  y: number;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (content: string, responsavel: string) => void;
}

export const CommentThread = ({ x, y, comments, onClose, onAddComment }: CommentThreadProps) => {
  const [newComment, setNewComment] = useState("");
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>("");

  const handleSubmit = () => {
    if (newComment.trim() && selectedResponsavel) {
      onAddComment(newComment, selectedResponsavel);
      setNewComment("");
      setSelectedResponsavel("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Card
      className="absolute w-80 max-h-96 flex flex-col shadow-xl z-[100]"
      style={{
        left: `${x + 20}px`,
        top: `${y}px`,
      }}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Comentários</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.filter(c => c.content.trim()).map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className={cn("h-8 w-8 flex-shrink-0", getAvatarColor(comment.author))}>
              <AvatarFallback className="text-white text-xs">
                {getInitials(comment.author)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground mt-1 break-words">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t space-y-2">
        <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Selecione o responsável" />
          </SelectTrigger>
          <SelectContent className="bg-card border z-[110]">
            {RESPONSAVEIS.map((responsavel) => (
              <SelectItem key={responsavel} value={responsavel}>
                {responsavel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!newComment.trim() || !selectedResponsavel}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
