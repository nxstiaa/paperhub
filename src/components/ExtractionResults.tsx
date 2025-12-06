import { useState } from "react";
import { Download, Copy, Check, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ExportData } from "@/types/extraction";

interface ExtractionResultsProps {
  data: ExportData;
}

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const percent = Math.round(confidence * 100);
  const variant = percent >= 80 ? "default" : percent >= 60 ? "secondary" : "destructive";
  
  return (
    <Badge variant={variant} className="text-xs">
      {percent >= 80 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
      {percent}%
    </Badge>
  );
};

const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <span className="font-medium text-sm text-foreground">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-card">{children}</div>}
    </div>
  );
};

const ExtractionResults = ({ data }: ExtractionResultsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { normalized, raw } = data;

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extraction-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "JSON downloaded" });
  };

  const handleDownloadCsv = () => {
    // Create CSV for measurements
    const headers = ["Property", "Value", "Unit (Original)", "SI Value", "SI Unit", "Material", "Confidence"];
    const rows = normalized.measurements.map(m => [
      m.property.canonicalName,
      m.value,
      m.unit.originalUnit,
      m.unit.siValue,
      m.unit.canonicalUnit,
      m.material || "",
      m.confidence,
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV downloaded" });
  };

  const handleDownloadTablesCsv = () => {
    if (!normalized.tables || normalized.tables.length === 0) return;
    
    // Create a combined CSV with all tables
    let csvContent = "";
    
    normalized.tables.forEach((table, tableIndex) => {
      csvContent += `\n# ${table.tableId}${table.caption ? ` - ${table.caption}` : ''}\n`;
      csvContent += `# Type: ${table.dataType}, Confidence: ${Math.round(table.confidence * 100)}%\n`;
      
      // Add headers
      csvContent += table.headers.map(h => `"${h}"`).join(",") + "\n";
      
      // Add rows
      table.rows.forEach(row => {
        csvContent += row.cells.map(cell => {
          const value = cell.numericValue !== null ? cell.numericValue : cell.value;
          const unit = cell.unit ? ` ${cell.unit}` : '';
          return `"${value}${unit}"`;
        }).join(",") + "\n";
      });
    });
    
    const blob = new Blob([csvContent.trim()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tables-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Tables CSV downloaded" });
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-secondary/30 p-4">
        <div>
          <h3 className="font-semibold text-foreground">Extraction Complete</h3>
          <p className="text-sm text-muted-foreground">
            Processed in {normalized.metadata.processingTimeMs}ms • 
            Model: {normalized.metadata.llmModel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={normalized.metadata.overallConfidence} />
          <Button variant="outline" size="sm" onClick={handleCopyJson}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadJson}>
            <Download className="h-4 w-4 mr-1" />
            JSON
          </Button>
          {normalized.measurements.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          )}
          {normalized.tables && normalized.tables.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadTablesCsv}>
              <Download className="h-4 w-4 mr-1" />
              Tables
            </Button>
          )}
        </div>
      </div>

      {/* Warnings */}
      {normalized.metadata.warnings.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Warnings
          </h4>
          <ul className="text-sm text-destructive/80 list-disc list-inside space-y-1">
            {normalized.metadata.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Title & Abstract */}
      <CollapsibleSection title="Title & Abstract">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
            <p className="text-foreground">{normalized.title}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Abstract</label>
            <p className="text-sm text-foreground/80">{normalized.abstract}</p>
          </div>
          {normalized.keywords.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {normalized.keywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Authors */}
      <CollapsibleSection title={`Authors (${normalized.authors.length})`}>
        <div className="space-y-2">
          {normalized.authors.map((author, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <div>
                <p className="font-medium text-sm text-foreground">{author.canonicalName}</p>
                <p className="text-xs text-muted-foreground">
                  {author.email && <span className="mr-3">{author.email}</span>}
                  {author.affiliation && <span>{author.affiliation}</span>}
                </p>
              </div>
              <ConfidenceBadge confidence={author.confidence} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Publication Info */}
      <CollapsibleSection title="Publication Details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Journal</label>
            <p className="text-foreground">{normalized.journal.name}</p>
            {normalized.journal.abbreviation && (
              <p className="text-xs text-muted-foreground">{normalized.journal.abbreviation}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">DOI</label>
            <p className="text-foreground">{normalized.doi || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Date</label>
            <p className="text-foreground">{normalized.publicationDate || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Volume/Issue</label>
            <p className="text-foreground">
              {normalized.journal.volume ? `Vol. ${normalized.journal.volume}` : ""} 
              {normalized.journal.issue ? `, Issue ${normalized.journal.issue}` : ""}
              {!normalized.journal.volume && !normalized.journal.issue && "N/A"}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Materials */}
      {normalized.materials.length > 0 && (
        <CollapsibleSection title={`Materials (${normalized.materials.length})`}>
          <div className="space-y-3">
            {normalized.materials.map((mat, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{mat.canonicalName}</span>
                  <ConfidenceBadge confidence={mat.confidence} />
                </div>
                {mat.formula && (
                  <p className="text-sm font-mono text-primary">{mat.formula}</p>
                )}
                {mat.chemicalClass && (
                  <Badge variant="secondary" className="mt-1 text-xs">{mat.chemicalClass}</Badge>
                )}
                {mat.synonyms && mat.synonyms.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Also known as: {mat.synonyms.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Measurements */}
      {normalized.measurements.length > 0 && (
        <CollapsibleSection title={`Measurements (${normalized.measurements.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">Property</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">Original</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">SI Value</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">Material</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {normalized.measurements.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-2">
                      <span className="font-medium text-foreground">{m.property.canonicalName}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">{m.property.category}</span>
                    </td>
                    <td className="py-2 px-2 font-mono text-foreground">
                      {m.value} {m.unit.originalUnit}
                    </td>
                    <td className="py-2 px-2 font-mono text-primary">
                      {m.unit.siValue.toExponential(3)} {m.unit.canonicalUnit}
                    </td>
                    <td className="py-2 px-2 text-foreground">{m.material || "—"}</td>
                    <td className="py-2 px-2">
                      <ConfidenceBadge confidence={m.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Tables */}
      {normalized.tables && normalized.tables.length > 0 && (
        <CollapsibleSection title={`Extracted Tables (${normalized.tables.length})`}>
          <div className="space-y-6">
            {normalized.tables.map((table, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-secondary/30 px-4 py-2">
                  <div>
                    <span className="font-medium text-foreground">{table.tableId}</span>
                    {table.caption && (
                      <p className="text-xs text-muted-foreground mt-0.5">{table.caption}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{table.dataType}</Badge>
                    <ConfidenceBadge confidence={table.confidence} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20">
                        {table.headers.map((header, hi) => (
                          <th key={hi} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-border/50">
                          {row.cells.map((cell, ci) => (
                            <td key={ci} className={`py-2 px-3 ${cell.isHeader ? 'font-medium' : ''}`}>
                              <span className="text-foreground">{cell.value}</span>
                              {cell.unit && (
                                <span className="text-muted-foreground ml-1 text-xs">({cell.unit})</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {table.relatedMaterials && table.relatedMaterials.length > 0 && (
                  <div className="px-4 py-2 bg-secondary/10 border-t border-border">
                    <span className="text-xs text-muted-foreground">Related materials: </span>
                    {table.relatedMaterials.map((mat, mi) => (
                      <Badge key={mi} variant="secondary" className="text-xs mr-1">{mat}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Raw Extraction (for debugging) */}
      <CollapsibleSection title="Raw GROBID Output" defaultOpen={false}>
        <pre className="text-xs bg-secondary/50 rounded-lg p-3 overflow-x-auto max-h-64">
          {JSON.stringify(raw, null, 2)}
        </pre>
      </CollapsibleSection>
    </div>
  );
};

export default ExtractionResults;
