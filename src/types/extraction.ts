// Layer 1: Raw Extraction Types (GROBID output)
export interface RawExtraction {
  title: string | null;
  authors: RawAuthor[];
  abstract: string | null;
  keywords: string[];
  doi: string | null;
  publicationDate: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  references: RawReference[];
  materials: RawMaterial[];
  measurements: RawMeasurement[];
  affiliations: string[];
  tables: RawTable[];
}

export interface RawTable {
  pageNumber: number;
  caption: string | null;
  rawContent: string;
}

export interface RawAuthor {
  fullName: string;
  givenName?: string;
  surname?: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

export interface RawReference {
  title?: string;
  authors?: string[];
  journal?: string;
  year?: string;
  doi?: string;
}

export interface RawMaterial {
  name: string;
  formula?: string;
  properties?: string[];
}

export interface RawMeasurement {
  property: string;
  value: string;
  unit: string;
  material?: string;
  conditions?: string;
}

// Layer 2: Normalized/Standardized Types
export interface NormalizedExtraction {
  title: string;
  authors: NormalizedAuthor[];
  abstract: string;
  keywords: string[];
  doi: string | null;
  publicationDate: string | null;
  journal: NormalizedJournal;
  references: NormalizedReference[];
  materials: NormalizedMaterial[];
  measurements: NormalizedMeasurement[];
  tables: ExtractedTable[];
  metadata: ExtractionMetadata;
}

export interface ExtractedTable {
  tableId: string;
  pageNumber: number;
  caption: string | null;
  headers: string[];
  rows: TableRow[];
  dataType: 'experimental' | 'comparative' | 'properties' | 'parameters' | 'other';
  relatedMaterials: string[];
  confidence: number;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  value: string;
  numericValue: number | null;
  unit: string | null;
  isHeader: boolean;
  columnIndex: number;
  rowIndex: number;
}

export interface NormalizedAuthor {
  canonicalName: string; // "Surname, Given Name"
  givenName: string;
  surname: string;
  email: string | null;
  affiliation: string | null;
  orcid: string | null;
  confidence: number; // 0-1
}

export interface NormalizedJournal {
  name: string;
  abbreviation: string | null;
  issn: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
}

export interface NormalizedReference {
  title: string;
  authors: string[]; // Canonical names
  journal: string | null;
  year: number | null;
  doi: string | null;
  confidence: number;
}

export interface NormalizedMaterial {
  canonicalName: string;
  formula: string | null;
  chemicalClass: string | null; // e.g., "polymer", "alloy", "ceramic"
  synonyms: string[];
  properties: NormalizedProperty[];
  confidence: number;
}

export interface NormalizedProperty {
  name: string; // Canonical property name
  originalName: string;
  category: string; // e.g., "mechanical", "thermal", "electrical"
}

export interface NormalizedMeasurement {
  property: NormalizedMeasurementProperty;
  value: number;
  unit: NormalizedUnit;
  material: string | null;
  conditions: MeasurementConditions | null;
  confidence: number;
}

export interface NormalizedMeasurementProperty {
  canonicalName: string;
  originalName: string;
  category: string;
}

export interface NormalizedUnit {
  canonicalUnit: string; // SI base or derived
  originalUnit: string;
  conversionFactor: number;
  siValue: number; // Value converted to SI
}

export interface MeasurementConditions {
  temperature?: { value: number; unit: string };
  pressure?: { value: number; unit: string };
  humidity?: { value: number; unit: string };
  other?: Record<string, string>;
}

export interface ExtractionMetadata {
  extractionTimestamp: string;
  grobidVersion: string | null;
  llmModel: string;
  processingTimeMs: number;
  overallConfidence: number;
  warnings: string[];
}

// Ontology / Controlled Vocabulary
export const PROPERTY_ONTOLOGY: Record<string, { canonical: string; category: string; synonyms: string[] }> = {
  // Mechanical Properties
  "tensile_strength": { canonical: "Tensile Strength", category: "mechanical", synonyms: ["ultimate tensile strength", "UTS", "breaking strength"] },
  "yield_strength": { canonical: "Yield Strength", category: "mechanical", synonyms: ["yield stress", "σy", "0.2% proof stress"] },
  "elastic_modulus": { canonical: "Elastic Modulus", category: "mechanical", synonyms: ["Young's modulus", "E", "modulus of elasticity", "stiffness"] },
  "hardness": { canonical: "Hardness", category: "mechanical", synonyms: ["Vickers hardness", "HV", "Rockwell hardness", "Brinell hardness"] },
  "elongation": { canonical: "Elongation", category: "mechanical", synonyms: ["strain at break", "ductility", "% elongation"] },
  "fracture_toughness": { canonical: "Fracture Toughness", category: "mechanical", synonyms: ["KIC", "K1C", "critical stress intensity factor"] },
  
  // Thermal Properties
  "thermal_conductivity": { canonical: "Thermal Conductivity", category: "thermal", synonyms: ["k", "λ", "heat conductivity"] },
  "melting_point": { canonical: "Melting Point", category: "thermal", synonyms: ["Tm", "melting temperature", "liquidus temperature"] },
  "glass_transition": { canonical: "Glass Transition Temperature", category: "thermal", synonyms: ["Tg", "glass transition point"] },
  "thermal_expansion": { canonical: "Coefficient of Thermal Expansion", category: "thermal", synonyms: ["CTE", "α", "linear expansion coefficient"] },
  
  // Electrical Properties
  "electrical_conductivity": { canonical: "Electrical Conductivity", category: "electrical", synonyms: ["σ", "conductance", "specific conductance"] },
  "resistivity": { canonical: "Electrical Resistivity", category: "electrical", synonyms: ["ρ", "specific resistance"] },
  "dielectric_constant": { canonical: "Dielectric Constant", category: "electrical", synonyms: ["εr", "relative permittivity", "dielectric permittivity"] },
  "bandgap": { canonical: "Band Gap", category: "electrical", synonyms: ["Eg", "energy gap", "band gap energy"] },
  
  // Other Properties
  "density": { canonical: "Density", category: "physical", synonyms: ["ρ", "specific gravity", "mass density"] },
  "porosity": { canonical: "Porosity", category: "physical", synonyms: ["void fraction", "pore volume fraction"] },
};

export const UNIT_CONVERSIONS: Record<string, { si: string; factor: number }> = {
  // Length
  "nm": { si: "m", factor: 1e-9 },
  "μm": { si: "m", factor: 1e-6 },
  "um": { si: "m", factor: 1e-6 },
  "mm": { si: "m", factor: 1e-3 },
  "cm": { si: "m", factor: 1e-2 },
  "m": { si: "m", factor: 1 },
  "Å": { si: "m", factor: 1e-10 },
  
  // Pressure/Stress
  "Pa": { si: "Pa", factor: 1 },
  "kPa": { si: "Pa", factor: 1e3 },
  "MPa": { si: "Pa", factor: 1e6 },
  "GPa": { si: "Pa", factor: 1e9 },
  "bar": { si: "Pa", factor: 1e5 },
  "psi": { si: "Pa", factor: 6894.76 },
  "ksi": { si: "Pa", factor: 6894760 },
  
  // Temperature
  "K": { si: "K", factor: 1 },
  "°C": { si: "K", factor: 1 }, // offset handled separately
  "°F": { si: "K", factor: 1 }, // offset handled separately
  
  // Energy
  "J": { si: "J", factor: 1 },
  "kJ": { si: "J", factor: 1e3 },
  "eV": { si: "J", factor: 1.602e-19 },
  "meV": { si: "J", factor: 1.602e-22 },
  
  // Thermal Conductivity
  "W/(m·K)": { si: "W/(m·K)", factor: 1 },
  "W/mK": { si: "W/(m·K)", factor: 1 },
  
  // Electrical
  "S/m": { si: "S/m", factor: 1 },
  "S/cm": { si: "S/m", factor: 100 },
  "Ω·m": { si: "Ω·m", factor: 1 },
  "Ω·cm": { si: "Ω·m", factor: 0.01 },
  
  // Density
  "kg/m³": { si: "kg/m³", factor: 1 },
  "g/cm³": { si: "kg/m³", factor: 1000 },
  "g/mL": { si: "kg/m³", factor: 1000 },
};

// Export formats
export interface ExportData {
  raw: RawExtraction;
  normalized: NormalizedExtraction;
  exportedAt: string;
}
