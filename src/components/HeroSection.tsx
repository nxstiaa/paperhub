import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="container">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">
              Materials Science Research Made Simple
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Discover, Organize & Share{" "}
            <span className="text-primary">Materials Science</span> Research
          </h1>
          
          <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
            Access curated papers from Nature, generate standardized READMEs, 
            and find datasets & code repositories—all in one place.
          </p>
          
          {/* Search bar */}
          <div className="relative mx-auto max-w-xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search papers by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          {/* Quick stats */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">150+</span>
              <span className="text-muted-foreground">Papers</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">80+</span>
              <span className="text-muted-foreground">Datasets</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">45+</span>
              <span className="text-muted-foreground">GitHub Repos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
