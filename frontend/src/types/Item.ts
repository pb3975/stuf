interface Item {
  id: number;
  name: string;
  category: string;
  quantity: number;
  custom_attributes: Record<string, string | number | boolean>;
  image_url?: string;
  qr_code_url?: string;
}

export type { Item };