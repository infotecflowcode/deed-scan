import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentMarkerProps {
  x: number;
  y: number;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const CommentMarker = ({ x, y, count, isActive, onClick }: CommentMarkerProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute w-8 h-8 rounded-full flex items-center justify-center transition-all z-50",
        "shadow-lg hover:scale-110 cursor-pointer",
        isActive 
          ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
          : "bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      )}
      style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
    >
      <MessageSquare className="w-4 h-4" />
      {count > 1 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </button>
  );
};
