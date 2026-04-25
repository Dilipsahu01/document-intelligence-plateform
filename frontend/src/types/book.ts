export interface Book {
  id: number;
  title: string;
  author: string;
  rating: number;
  genre: string;
  sentiment: string;
  description: string;
  price?: string;
  availability?: string;
}
