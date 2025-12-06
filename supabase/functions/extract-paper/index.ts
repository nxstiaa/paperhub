import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// GROBID public service endpoint
const GROBID_URL = "https://kermitt2-grobid.hf.space/api/processFulltextDocument";

interface RawAuthor {
  fullName: string;
  givenName?: string;
  surname?: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

interface RawMaterial {
  name: string;
  formula?: string;
  properties?: string[];
}

interface RawMeasurement {
  property: string;
  value: string;
  unit: string;
  material?: string;
  conditions?: string;
}

interface RawTable {
  pageNumber: number;
  caption: string | null;
  rawContent: string;
}

interface RawExtraction {
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
  references: Array<{title?: string; authors?: string[]; journal?: string; year?: string; doi?: string}>;
  materials: RawMaterial[];
  measurements: RawMeasurement[];
  affiliations: string[];
  tables: RawTable[];
}

// Parse GROBID TEI XML response
function parseGrobidXml(xmlText: string): RawExtraction {
  const extraction: RawExtraction = {
    title: null,
    authors: [],
    abstract: null,
    keywords: [],
    doi: null,
    publicationDate: null,
    journal: null,
    volume: null,
    issue: null,
    pages: null,
    references: [],
    materials: [],
    measurements: [],
    affiliations: [],
    tables: [],
  };

  // Extract title
  const titleMatch = xmlText.match(/<title[^>]*type="main"[^>]*>([^<]+)<\/title>/);
  extraction.title = titleMatch ? titleMatch[1].trim() : null;

  // Extract abstract
  const abstractMatch = xmlText.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/);
  if (abstractMatch) {
    extraction.abstract = abstractMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Extract authors
  const authorMatches = xmlText.matchAll(/<author[^>]*>([\s\S]*?)<\/author>/g);
  for (const match of authorMatches) {
    const authorXml = match[1];
    const surnameMatch = authorXml.match(/<surname>([^<]+)<\/surname>/);
    const forenameMatch = authorXml.match(/<forename[^>]*>([^<]+)<\/forename>/);
    const emailMatch = authorXml.match(/<email>([^<]+)<\/email>/);
    const orcidMatch = authorXml.match(/orcid[^>]*>([^<]+)</);
    
    if (surnameMatch || forenameMatch) {
      const surname = surnameMatch ? surnameMatch[1].trim() : '';
      const givenName = forenameMatch ? forenameMatch[1].trim() : '';
      extraction.authors.push({
        fullName: `${givenName} ${surname}`.trim(),
        givenName: givenName || undefined,
        surname: surname || undefined,
        email: emailMatch ? emailMatch[1].trim() : undefined,
        orcid: orcidMatch ? orcidMatch[1].trim() : undefined,
      });
    }
  }

  // Extract DOI
  const doiMatch = xmlText.match(/<idno type="DOI">([^<]+)<\/idno>/i);
  extraction.doi = doiMatch ? doiMatch[1].trim() : null;

  // Extract publication date
  const dateMatch = xmlText.match(/<date[^>]*when="([^"]+)"[^>]*>/);
  extraction.publicationDate = dateMatch ? dateMatch[1] : null;

  // Extract journal info
  const journalMatch = xmlText.match(/<title[^>]*level="j"[^>]*>([^<]+)<\/title>/);
  extraction.journal = journalMatch ? journalMatch[1].trim() : null;

  // Extract keywords
  const keywordMatches = xmlText.matchAll(/<term>([^<]+)<\/term>/g);
  for (const match of keywordMatches) {
    extraction.keywords.push(match[1].trim());
  }

  // Extract affiliations
  const affiliationMatches = xmlText.matchAll(/<affiliation[^>]*>([\s\S]*?)<\/affiliation>/g);
  for (const match of affiliationMatches) {
    const orgMatch = match[1].match(/<orgName[^>]*>([^<]+)<\/orgName>/);
    if (orgMatch) {
      extraction.affiliations.push(orgMatch[1].trim());
    }
  }

  // Extract references
  const refMatches = xmlText.matchAll(/<biblStruct[^>]*>([\s\S]*?)<\/biblStruct>/g);
  for (const match of refMatches) {
    const refXml = match[1];
    const refTitleMatch = refXml.match(/<title[^>]*>([^<]+)<\/title>/);
    const refJournalMatch = refXml.match(/<title[^>]*level="j"[^>]*>([^<]+)<\/title>/);
    const refYearMatch = refXml.match(/<date[^>]*when="(\d{4})/);
    const refDoiMatch = refXml.match(/<idno type="DOI">([^<]+)<\/idno>/i);
    
    extraction.references.push({
      title: refTitleMatch ? refTitleMatch[1].trim() : undefined,
      journal: refJournalMatch ? refJournalMatch[1].trim() : undefined,
      year: refYearMatch ? refYearMatch[1] : undefined,
      doi: refDoiMatch ? refDoiMatch[1].trim() : undefined,
    });
  }

  // Extract tables from GROBID XML
  const tableMatches = xmlText.matchAll(/<figure[^>]*type="table"[^>]*>([\s\S]*?)<\/figure>/g);
  let tableIndex = 0;
  for (const match of tableMatches) {
    const tableXml = match[1];
    const captionMatch = tableXml.match(/<head>([^<]+)<\/head>/);
    const contentMatch = tableXml.match(/<table[^>]*>([\s\S]*?)<\/table>/);
    extraction.tables.push({
      pageNumber: tableIndex + 1, // Approximate
      caption: captionMatch ? captionMatch[1].trim() : null,
      rawContent: contentMatch ? contentMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
    });
    tableIndex++;
  }

  return extraction;
}

// Layer 2: LLM-based normalization using Lovable AI
async function normalizeWithLLM(rawExtraction: RawExtraction, llmApiKey: string): Promise<any> {
  const systemPrompt = `You are a materials science data extraction and normalization expert. Your task is to normalize extracted paper data into a standardized format.

For AUTHORS:
- Convert all names to "Surname, Given Name" format
- Assign confidence scores (0-1) based on name clarity
- Handle edge cases like multi-part surnames, initials, etc.

For MATERIALS:
- Identify chemical formulas where possible
- Classify into categories: polymer, alloy, ceramic, composite, semiconductor, etc.
- List common synonyms
- Extract mentioned properties

For MEASUREMENTS:
- Convert all values to SI units
- Identify the property being measured using canonical names:
  * Mechanical: Tensile Strength, Yield Strength, Elastic Modulus, Hardness, Elongation, Fracture Toughness
  * Thermal: Thermal Conductivity, Melting Point, Glass Transition Temperature, CTE
  * Electrical: Electrical Conductivity, Resistivity, Dielectric Constant, Band Gap
  * Physical: Density, Porosity
- Extract measurement conditions (temperature, pressure, etc.)
- Assign confidence scores

For TABLES:
- Parse table data into structured rows and columns
- Identify table type: experimental results, comparative data, material properties, process parameters
- Extract numeric values with their units
- Link table data to related materials mentioned
- Classify each cell as header or data
- Assign confidence scores based on data clarity

For JOURNAL:
- Provide standard abbreviation if known
- Include ISSN if identifiable

Return a JSON object with normalized data. Assign overall confidence score.`;

  const userPrompt = `Normalize this extracted paper data:

TITLE: ${rawExtraction.title || 'Unknown'}

AUTHORS:
${rawExtraction.authors.map(a => `- ${a.fullName}${a.email ? ` (${a.email})` : ''}${a.affiliation ? ` - ${a.affiliation}` : ''}`).join('\n')}

ABSTRACT: ${rawExtraction.abstract || 'Not available'}

KEYWORDS: ${rawExtraction.keywords.join(', ') || 'None'}

JOURNAL: ${rawExtraction.journal || 'Unknown'}
DOI: ${rawExtraction.doi || 'Unknown'}
DATE: ${rawExtraction.publicationDate || 'Unknown'}

AFFILIATIONS:
${rawExtraction.affiliations.join('\n') || 'None listed'}

RAW TABLES (from GROBID extraction):
${rawExtraction.tables.length > 0 
  ? rawExtraction.tables.map((t, i) => `Table ${i + 1}${t.caption ? ` - "${t.caption}"` : ''}:\n${t.rawContent}`).join('\n\n')
  : 'No tables found in extraction'}

Parse the tables into structured format. For each table:
1. Identify column headers
2. Extract rows with cell values
3. Detect numeric values and their units
4. Classify the table type (experimental, comparative, properties, parameters, other)
5. Link to any materials mentioned in the table

Also extract any materials and their properties from the abstract, and identify any numerical measurements with units.

Return a complete normalized JSON object.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llmApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "normalize_paper_data",
            description: "Return normalized paper extraction data",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                authors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      canonicalName: { type: "string", description: "Format: Surname, Given Name" },
                      givenName: { type: "string" },
                      surname: { type: "string" },
                      email: { type: "string", nullable: true },
                      affiliation: { type: "string", nullable: true },
                      orcid: { type: "string", nullable: true },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                    },
                    required: ["canonicalName", "givenName", "surname", "confidence"],
                  },
                },
                abstract: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                doi: { type: "string", nullable: true },
                publicationDate: { type: "string", nullable: true },
                journal: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    abbreviation: { type: "string", nullable: true },
                    issn: { type: "string", nullable: true },
                    volume: { type: "string", nullable: true },
                    issue: { type: "string", nullable: true },
                    pages: { type: "string", nullable: true },
                  },
                  required: ["name"],
                },
                materials: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      canonicalName: { type: "string" },
                      formula: { type: "string", nullable: true },
                      chemicalClass: { type: "string", nullable: true },
                      synonyms: { type: "array", items: { type: "string" } },
                      properties: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            originalName: { type: "string" },
                            category: { type: "string" },
                          },
                          required: ["name", "originalName", "category"],
                        },
                      },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                    },
                    required: ["canonicalName", "confidence"],
                  },
                },
                measurements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      property: {
                        type: "object",
                        properties: {
                          canonicalName: { type: "string" },
                          originalName: { type: "string" },
                          category: { type: "string" },
                        },
                        required: ["canonicalName", "originalName", "category"],
                      },
                      value: { type: "number" },
                      unit: {
                        type: "object",
                        properties: {
                          canonicalUnit: { type: "string" },
                          originalUnit: { type: "string" },
                          conversionFactor: { type: "number" },
                          siValue: { type: "number" },
                        },
                        required: ["canonicalUnit", "originalUnit", "conversionFactor", "siValue"],
                      },
                      material: { type: "string", nullable: true },
                      conditions: {
                        type: "object",
                        nullable: true,
                        properties: {
                          temperature: {
                            type: "object",
                            properties: { value: { type: "number" }, unit: { type: "string" } },
                          },
                          pressure: {
                            type: "object",
                            properties: { value: { type: "number" }, unit: { type: "string" } },
                          },
                        },
                      },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                    },
                    required: ["property", "value", "unit", "confidence"],
                  },
                },
                tables: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tableId: { type: "string" },
                      pageNumber: { type: "number" },
                      caption: { type: "string", nullable: true },
                      headers: { type: "array", items: { type: "string" } },
                      rows: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            cells: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  value: { type: "string" },
                                  numericValue: { type: "number", nullable: true },
                                  unit: { type: "string", nullable: true },
                                  isHeader: { type: "boolean" },
                                  columnIndex: { type: "number" },
                                  rowIndex: { type: "number" },
                                },
                                required: ["value", "isHeader", "columnIndex", "rowIndex"],
                              },
                            },
                          },
                          required: ["cells"],
                        },
                      },
                      dataType: { 
                        type: "string", 
                        enum: ["experimental", "comparative", "properties", "parameters", "other"] 
                      },
                      relatedMaterials: { type: "array", items: { type: "string" } },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                    },
                    required: ["tableId", "pageNumber", "headers", "rows", "dataType", "relatedMaterials", "confidence"],
                  },
                },
                overallConfidence: { type: "number", minimum: 0, maximum: 1 },
                warnings: { type: "array", items: { type: "string" } },
              },
              required: ["title", "authors", "abstract", "keywords", "journal", "materials", "measurements", "tables", "overallConfidence", "warnings"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "normalize_paper_data" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LLM API error:", response.status, errorText);
    throw new Error(`LLM normalization failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  
  throw new Error("Failed to parse LLM response");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No PDF file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Layer 1: GROBID Extraction
    const grobidFormData = new FormData();
    grobidFormData.append("input", file);
    grobidFormData.append("consolidateHeader", "1");
    grobidFormData.append("consolidateCitations", "0");
    grobidFormData.append("includeRawCitations", "0");
    grobidFormData.append("includeRawAffiliations", "1");

    console.log("Sending to GROBID...");
    const grobidResponse = await fetch(GROBID_URL, {
      method: "POST",
      body: grobidFormData,
    });

    if (!grobidResponse.ok) {
      const errorText = await grobidResponse.text();
      console.error("GROBID error:", grobidResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: "GROBID extraction failed", 
        details: `Status: ${grobidResponse.status}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const grobidXml = await grobidResponse.text();
    console.log("GROBID response received, parsing XML...");

    const rawExtraction = parseGrobidXml(grobidXml);
    console.log("Raw extraction complete:", JSON.stringify(rawExtraction, null, 2).substring(0, 500));
    console.log(`Found ${rawExtraction.tables.length} tables in document`);

    // Layer 2: LLM Normalization
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting LLM normalization...");
    const normalized = await normalizeWithLLM(rawExtraction, LOVABLE_API_KEY);

    const processingTimeMs = Date.now() - startTime;

    const result = {
      raw: rawExtraction,
      normalized: {
        ...normalized,
        references: rawExtraction.references.map(ref => ({
          title: ref.title || "Unknown",
          authors: ref.authors || [],
          journal: ref.journal || null,
          year: ref.year ? parseInt(ref.year) : null,
          doi: ref.doi || null,
          confidence: 0.7,
        })),
        metadata: {
          extractionTimestamp: new Date().toISOString(),
          grobidVersion: "0.8.0",
          llmModel: "google/gemini-2.5-flash",
          processingTimeMs,
          overallConfidence: normalized.overallConfidence || 0.8,
          warnings: normalized.warnings || [],
        },
      },
      exportedAt: new Date().toISOString(),
    };

    console.log(`Extraction complete in ${processingTimeMs}ms`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
