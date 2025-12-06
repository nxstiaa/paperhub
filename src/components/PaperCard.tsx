import { ExternalLink, Github, Database, FileText, Calendar, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Paper } from "@/data/papers";
import { cn } from "@/lib/utils";

interface PaperCardProps {
  paper: Paper;
  onGenerateReadme: (paper: Paper) => void;
  index: number;
}

const tagStyles: Record<string, string> = {
  ML: "tag-ml",
  Simulation: "tag-simulation",
  Dataset: "tag-dataset",
  GitHub: "tag-github",
  Experimental: "tag-paper",
  Automation: "tag-ml",
};

const PaperCard = ({ paper, onGenerateReadme, index }: PaperCardProps) => {
  return (
    <article 
      className="group rounded-xl border border-border bg-card p-6 card-shadow hover:card-shadow-hover transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {paper.category}
          </span>
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                tagStyles[tag] || "bg-secondary text-secondary-foreground"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {paper.title}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {paper.authors.join(", ")}
        </p>
      </div>
      
      {/* Abstract */}
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {paper.abstract}
      </p>
      
      {/* Meta info */}
      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(paper.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Quote className="h-3.5 w-3.5" />
          <span>{paper.citations} citations</span>
        </div>
      </div>
      
      {/* Dataset info */}
      {paper.datasetUrl && (
        <div className="mb-4 rounded-lg bg-accent/50 p-3">
          <div className="flex items-start gap-2">
            <Database className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Dataset Available</p>
              <p className="text-xs text-muted-foreground">{paper.datasetDescription}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        <a
          href={paper.natureUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Nature
        </a>
        
        {paper.githubUrl && (
          <a
            href={paper.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        )}
        
        {paper.datasetUrl && (
          <a
            href={paper.datasetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Database className="h-3.5 w-3.5" />
            Dataset
          </a>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGenerateReadme(paper)}
          className="ml-auto text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          README
        </Button>
      </div>
    </article>
  );
};

export default PaperCard;
