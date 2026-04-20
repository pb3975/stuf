export interface ApiError {
  response?: {
    status: number;
    data: unknown;
  };
  request?: unknown;
  message: string;
}

export interface TestResult {
  test: string;
  status: 'success' | 'error';
  message?: string;
  data?: unknown;
}

export interface SmartAddSuggestion {
  name: string;
  category: string;
  quantity: number;
  custom_attributes: Record<string, string | number | boolean>;
  similar_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    category: string;
  }>;
  price_estimate?: string;
  expiry_date?: string;
  barcode_data?: string;
}

export interface CustomAttribute {
  key: string;
  value: string | number | boolean;
} 