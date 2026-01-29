export interface Post {
  id: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  createdAt?: string;
  categories?: string[];
};

export type Category = {
  id: number;
  name: string;
};

export type ApiPost = {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  postCategories: { category: Category } [];
};

export type PostFormData = {
  title: string;
  content: string;
  thumbnailUrl: string;
  categories: number[];
};

export type CategoryFormData = {
  name: string;
};

// API リクエスト型
export type CreatePostRequest = {
  title: string;
  content: string;
  thumbnailUrl: string;
  categories: { id: number }[];
};

export type UpdatePostRequest = CreatePostRequest;

export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = CreateCategoryRequest;

// API レスポンス型
export type PostsResponse = {
  posts: ApiPost[];
};

export type CategoriesApiResponse = {
  categories: Category[];
};

export type ViewPost = {
  id: number;
  title: string;
  createdAt: string;
  categories: string[];
};