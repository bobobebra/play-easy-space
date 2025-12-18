import { Play } from "lucide-react";
import { Game } from "@/data/games";

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const GameCard = ({ game, onPlay }: GameCardProps) => {
  return (
    <div 
      className="game-card group cursor-pointer"
      onClick={() => onPlay(game)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-glow">
            <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Featured badge */}
        {game.featured && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
            Featured
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground">
          {game.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {game.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
