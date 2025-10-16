export interface Post {
  id: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  createdAt?: string;
  categories?: string[];
}