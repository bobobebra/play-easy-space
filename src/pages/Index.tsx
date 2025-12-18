import { useState, useMemo } from "react";
import { games, Game, Category } from "@/data/games";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { FeaturedGames } from "@/components/FeaturedGames";
import { Gamepad2 } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(search.toLowerCase()) ||
        game.description.toLowerCase().includes(search.toLowerCase()) ||
        game.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = category === "All" || game.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const handlePlay = (game: Game) => {
    setSelectedGame(game);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Gamepad2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">100% Ad-Free Gaming</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
              <span className="gradient-text">Play Instantly.</span>
              <br />
              <span className="text-foreground">No Interruptions.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personal gaming hub with {games.length}+ browser games. 
              No ads, no downloads, just pure gaming.
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col items-center gap-6">
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>
        </div>
      </section>

      {/* Games section */}
      <main className="container mx-auto px-4 pb-16">
        {/* Featured games - only show when no search/filter */}
        {!search && category === "All" && (
          <FeaturedGames games={games} onPlay={handlePlay} />
        )}

        {/* All games grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-foreground">
              {category === "All" ? "All Games" : category}
              <span className="ml-2 text-muted-foreground font-normal text-base">
                ({filteredGames.length})
              </span>
            </h2>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} onPlay={handlePlay} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">
                No games found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            GameVault • Ad-free gaming for ZimaOS
          </p>
        </div>
      </footer>

      {/* Game modal */}
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
};

export default Index;
