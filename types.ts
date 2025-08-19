
export interface CsvData {
  header: string[];
  rows: string[][];
}

export interface Suggestion {
  suggestion_type: 'STANDARDIZE_TEXT' | 'FLAG_OUTLIER' | 'FIX_FORMAT' | 'IMPUTE_MISSING' | 'REMOVE_DUPLICATE';
  column_name: string;
  row_index?: number;
  description: string;
  rationale: string;
  original_value?: string;
  suggested_value?: string;
}

export interface PseudoCode {
  r: string;
  python: string;
}

export interface TransformationLogEntry {
  id: number;
  timestamp: string;
  description: string;
  suggestion: Suggestion;
  pseudoCode: PseudoCode;
}
