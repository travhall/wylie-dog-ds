// Format Adapter Layer - Core interfaces and types
// Transforms diverse design token formats into the expected Wylie Dog structure

export interface FormatDetectionResult {
  format: TokenFormatType;
  confidence: number;
  structure: StructureInfo;
  warnings: string[];
}

export interface NormalizationResult {
  data: any; // Will be ExportData[] after normalization
  transformations: TransformationLog[];
  warnings: string[];
  errors: string[];
  success: boolean;
}

export interface FormatAdapter {
  name: string;
  detect(data: any): FormatDetectionResult;
  normalize(data: any): NormalizationResult;
  validate(data: any): boolean;
}

export enum TokenFormatType {
  WYLIE_DOG = "wylie-dog",
  STYLE_DICTIONARY_FLAT = "style-dictionary-flat",
  STYLE_DICTIONARY_NESTED = "style-dictionary-nested",
  TOKENS_STUDIO_FLAT = "tokens-studio-flat",
  TOKENS_STUDIO_GROUPED = "tokens-studio-grouped",
  MATERIAL_DESIGN = "material-design",
  W3C_DTCG_FLAT = "w3c-dtcg-flat",
  FIGMA_DESIGN_TOKENS = "figma-design-tokens",
  CSS_VARIABLES = "css-variables",
  CUSTOM_FLAT = "custom-flat",
  UNKNOWN = "unknown",
}

export interface StructureInfo {
  hasCollections: boolean;
  hasModes: boolean;
  hasArrayWrapper: boolean;
  tokenCount: number;
  referenceCount: number;
  propertyFormat: "$type/$value" | "type/value" | "mixed" | "other";
  namingConvention:
    | "dot-notation"
    | "kebab-case"
    | "camelCase"
    | "snake_case"
    | "mixed";
  referenceFormat: "curly-brace" | "css-var" | "sass" | "other" | "none";
}

export interface TransformationLog {
  type: string;
  description: string;
  before: string;
  after: string;
}

export interface AdapterProcessResult {
  success: boolean;
  data: any[]; // ExportData[] after successful processing
  detection: FormatDetectionResult;
  transformations: TransformationLog[];
  warnings: string[];
  errors: string[];
  suggestions?: string[];
  processingTime: number;
  stats: ProcessingStats;
}

export interface ProcessingStats {
  totalTokens: number;
  totalReferences: number;
  totalCollections: number;
  averageTokensPerCollection: number;
}

export interface ReferenceTransformation {
  type: "reference-format";
  original: string;
  normalized: string;
  format: string;
}
