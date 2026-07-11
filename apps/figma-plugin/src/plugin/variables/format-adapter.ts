// Format Adapter Layer - Core interfaces and types
// Transforms diverse design token formats into the expected Wylie Dog structure

import type { ExportData } from "./processor";

export interface FormatDetectionResult {
  format: TokenFormatType;
  confidence: number;
  structure: StructureInfo;
  warnings: string[];
}

export interface NormalizationResult {
  data: ExportData[];
  transformations: TransformationLog[];
  warnings: string[];
  errors: string[];
  success: boolean;
}

export interface FormatAdapter {
  name: string;
  detect(data: unknown): FormatDetectionResult;
  normalize(data: unknown): NormalizationResult;
  validate(data: unknown): boolean;
}

export enum TokenFormatType {
  W3C_DTCG_FLAT = "w3c-dtcg-flat",
  WYLIE_DOG = "wylie-dog", // Internal format for @wyliedog/tokens
  STYLE_DICTIONARY_FLAT = "style-dictionary-flat",
  STYLE_DICTIONARY_NESTED = "style-dictionary-nested",
  TOKENS_STUDIO_FLAT = "tokens-studio-flat",
  TOKENS_STUDIO_GROUPED = "tokens-studio-grouped",
  FIGMA_DESIGN_TOKENS = "figma-design-tokens",
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
    "dot-notation" | "kebab-case" | "camelCase" | "snake_case" | "mixed";
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
  data: ExportData[];
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
