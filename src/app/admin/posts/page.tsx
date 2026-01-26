"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateButton from "../_components/CreateButton";
import { LoadingState } from "../_components/LoadingState";
import CategoryTag from "../_components/CategoryTag";

type ApiPost = {
  id: number;
  title: string;
  createdAt: string;
  postCategories: { category: { name: string } }[];
};

type ApiResponse = {
  posts: ApiPost[];
};

type ViewPost = {
  id: number;
  title: string;
  createdAt: string;
  categories: string[];
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ViewPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      const res = await fetch("/api/admin/posts");
      const data: ApiResponse = await res.json();
      const list = (data.posts ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        createdAt: p.createdAt,
        categories: p.postCategories?.map((pc) => pc.category.name) ?? [],
      }));
      setPosts(list);
      setLoading(false);
    };
    fetcher();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">記事一覧</h1>
        <CreateButton href="/admin/posts/new" />
      </div>

      <div className="divide-y divide-gray-300 border-b border-gray-300">
        {posts.map((p) => (
          <Link key={p.id} href={`/admin/posts/${p.id}`} className="block">
            <div className="p-4 hover:bg-gray-100 cursor-pointer transition">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(p.createdAt).toLocaleDateString("ja-JP")}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.categories.map((c) => (
                  <CategoryTag key={c} name={c} />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}