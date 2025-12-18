import { X, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Game } from "@/data/games";
import { useState } from "react";

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

export const GameModal = ({ game, onClose }: GameModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!game) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] m-4 flex flex-col">
        {/* Header */}
        <div className="glass-panel rounded-t-xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {game.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {game.category} • {game.tags.join(", ")}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={game.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game iframe */}
        <div className="flex-1 bg-background rounded-b-xl overflow-hidden border border-border border-t-0">
          <iframe
            src={game.embedUrl}
            className="w-full h-full"
            allow="fullscreen; autoplay; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
            title={game.title}
          />
        </div>
      </div>
    </div>
  );
};
