import { Game } from "@/data/games";
import { Play, Star } from "lucide-react";

interface FeaturedGamesProps {
  games: Game[];
  onPlay: (game: Game) => void;
}

export const FeaturedGames = ({ games, onPlay }: FeaturedGamesProps) => {
  const featuredGames = games.filter((g) => g.featured).slice(0, 4);

  if (featuredGames.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-secondary fill-secondary" />
        <h2 className="font-display font-bold text-xl text-foreground">
          Featured Games
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredGames.map((game, index) => (
          <div
            key={game.id}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
              index === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
            onClick={() => onPlay(game)}
          >
            <div className={`relative ${index === 0 ? "aspect-square" : "aspect-video"}`}>
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-glow transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="px-2 py-1 rounded-md bg-secondary/20 backdrop-blur-sm w-fit text-xs font-medium text-secondary mb-2">
                  {game.category}
                </div>
                <h3 className={`font-display font-bold text-foreground ${
                  index === 0 ? "text-2xl" : "text-lg"
                }`}>
                  {game.title}
                </h3>
                <p className={`text-muted-foreground mt-1 line-clamp-2 ${
                  index === 0 ? "text-sm" : "text-xs"
                }`}>
                  {game.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
