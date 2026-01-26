"use client";

import  { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types";
import CategoryTag from "./admin/_components/CategoryTag";

type ApiPost = {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
  postCategories: { category: { name: string } }[];
};

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetcher = async () => {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // API の構造に応じて data.posts か data を使う
        const list: Post[] = (data.posts ?? []).map((p: ApiPost) => ({
          id: String(p.id),
          title: p.title,
          content: p.content,
          thumbnailUrl: p.thumbnailUrl,
          createdAt: p.createdAt,
          categories: p.postCategories?.map((pc) => pc.category.name) ?? [],
        }));
        if (mounted) setPosts(list);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetcher();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">エラー: {error}</div>;

  return (
    <>
      {posts.map((p) => (
        <article key={p.id} className="border border-gray-300 p-4 mb-6 shadow-sm hover:shadow-md transition max-w-700 mt-11">
          <Link href={`/posts/${p.id}`} className="block">
            <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
            {p.thumbnailUrl && /^https?:\/\//.test(p.thumbnailUrl) && (
              <Image
                src={p.thumbnailUrl}
                alt={p.title}
                width={800}
                height={400}
                className="w-full h-auto mb-2"
              />
            )}
            <div className="text-sm text-gray-500 mb-2">
              {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
            </div>
            <div className="mb-2">
              {Array.isArray(p.categories) &&
                p.categories.map((c) => (
                  <CategoryTag key={c} name={c} />
                ))}
            </div>
            <div
              className="line-clamp-2 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: p.content }}
            />
          </Link>
        </article>
      ))}
    </>
  );
}
