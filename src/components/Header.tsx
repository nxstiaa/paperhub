import { BookOpen, Github, Database } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">MatSci Papers</h1>
            <p className="text-xs text-muted-foreground">Materials Science Research Hub</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <a 
            href="#papers" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Papers
          </a>
          <a 
            href="#datasets" 
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Database className="h-4 w-4" />
            Datasets
          </a>
          <a 
            href="#readme" 
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            README Generator
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
