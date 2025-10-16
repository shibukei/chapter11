"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetcher = async () => {
      try {
        const res = await fetch(
          "https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // API の構造に応じて data.posts か data を使う
        const list: Post[] = data.posts ?? data;
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
        <Link key={p.id} href={`/posts/${p.id}`} className="block">
          <article className="border border-gray-300 p-4 mb-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
            {p.thumbnailUrl && (
              <Image
                src={p.thumbnailUrl}
                alt={p.title}
                className="w-full h-auto mb-2"
              />
            )}
            <div className="text-sm text-gray-500 mb-2">
              {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
            </div>
            <div className="mb-2">
              {Array.isArray(p.categories) &&
                p.categories.map((c) => (
                  <span
                    key={c}
                    className="text-xs border border-[#06c] text-[#06c] rounded px-2 py-1 mr-2"
                  >
                    {c}
                  </span>
                ))}
            </div>
            <div
              className="line-clamp-2 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: p.content }}
            />
          </article>
        </Link>
      ))}
    </>
  );
}
