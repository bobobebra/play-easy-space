import { Gamepad2 } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl gradient-text">
              GameVault
            </h1>
            <p className="text-xs text-muted-foreground">
              Ad-free gaming portal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
