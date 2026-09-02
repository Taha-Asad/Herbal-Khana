export interface FAQCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful?: number;
  notHelpful?: number;
}
