import { useState, useMemo } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import PaperCard from "@/components/PaperCard";
import ReadmeModal from "@/components/ReadmeModal";
import { papers, categories, Paper } from "@/data/papers";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        searchQuery === "" ||
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some((author) =>
          author.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || paper.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleGenerateReadme = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        {/* Papers Section */}
        <section id="papers" className="py-12 lg:py-16">
          <div className="container">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Latest Papers</h2>
                <p className="text-muted-foreground">
                  {filteredPapers.length} papers found
                </p>
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            
            {filteredPapers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPapers.map((paper, index) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onGenerateReadme={handleGenerateReadme}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No papers found matching your criteria.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filter.
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Datasets Section */}
        <section id="datasets" className="border-t border-border bg-secondary/30 py-12 lg:py-16">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Available Datasets</h2>
              <p className="text-muted-foreground">
                Quick access to research datasets
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {papers
                .filter((p) => p.datasetUrl)
                .map((paper, index) => (
                  <a
                    key={paper.id}
                    href={paper.datasetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-lg border border-border bg-card p-4 card-shadow hover:card-shadow-hover transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="mb-2 text-sm font-medium text-primary group-hover:underline">
                      {paper.title.length > 50
                        ? paper.title.substring(0, 50) + "..."
                        : paper.title}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {paper.datasetDescription}
                    </p>
                  </a>
                ))}
            </div>
          </div>
        </section>
        
        {/* README Template Section */}
        <section id="readme" className="py-12 lg:py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Standardized README Template
              </h2>
              <p className="mb-8 text-muted-foreground">
                Generate consistent, well-structured READMEs for any paper. 
                Click the "README" button on any paper card to get started.
              </p>
              
              <div className="rounded-xl border border-border bg-card p-6 text-left">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Template Includes
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Overview & Abstract
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Author List & Publication Details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Links (Paper, GitHub, Dataset)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Dataset Information & Access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Installation Instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    BibTeX Citation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            MatSci Papers Hub — Curating materials science research from Nature
          </p>
        </div>
      </footer>
      
      <ReadmeModal
        paper={selectedPaper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Index;
