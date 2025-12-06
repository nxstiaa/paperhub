import { useState } from "react";
import { ArrowLeft, Layers, Brain, FileOutput } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PdfUploader from "@/components/PdfUploader";
import ExtractionResults from "@/components/ExtractionResults";
import type { ExportData } from "@/types/extraction";

const Extract = () => {
  const [extractedData, setExtractedData] = useState<ExportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Papers
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            PDF Data Extraction
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload a scientific paper PDF to extract and standardize its data using our 
            two-layer extraction pipeline.
          </p>
        </div>

        {/* Pipeline explanation */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Layer 1: Extraction</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              GROBID parses PDF structure to extract raw metadata, authors, 
              abstract, references, and inline content in TEI-XML format.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Layer 2: Normalization</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              LLM interprets and standardizes data: author names → canonical format, 
              units → SI, properties → controlled vocabulary with confidence scores.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileOutput className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Export</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download standardized data as JSON (full structure) or CSV 
              (measurements table). Includes both raw and normalized outputs.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Upload section */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Upload PDF
              </h2>
              <PdfUploader 
                onExtracted={setExtractedData}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </div>

            {/* Ontology info */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Controlled Vocabulary
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong className="text-foreground">Mechanical:</strong> Tensile Strength, Yield Strength, Elastic Modulus, Hardness, Elongation, Fracture Toughness</p>
                <p><strong className="text-foreground">Thermal:</strong> Thermal Conductivity, Melting Point, Glass Transition Temperature, CTE</p>
                <p><strong className="text-foreground">Electrical:</strong> Electrical Conductivity, Resistivity, Dielectric Constant, Band Gap</p>
                <p><strong className="text-foreground">Physical:</strong> Density, Porosity</p>
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="lg:col-span-3">
            {extractedData ? (
              <ExtractionResults data={extractedData} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <FileOutput className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No extraction yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Upload a PDF to see the extracted and normalized data here. 
                  Both raw GROBID output and LLM-standardized results will be displayed.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-8 mt-12">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            MatSci Papers Hub — PDF Extraction Pipeline
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Extract;
