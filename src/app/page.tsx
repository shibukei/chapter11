"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MicroCmsPost } from "../pp/_types/MicroCmsPost";

export default function Posts() {
  const [posts, setPosts] = useState<MicroCmsPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetcher = async () => {
      try {
        const res = await fetch(
          "https://7h03f65xfg.microcms.io/api/v1/posts",
          {
            headers: {
              'X-MICROCMS-API-KEY': process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
            },
          });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // microCMSのレスポンス構造: { contents: MicroCmsPost[] }
        const list: MicroCmsPost[] = data.contents ?? [];
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
      {posts.map((p, index) => (
        <Link key={p.id} href={`/posts/${p.id}`} className="block">
          <article className="border border-gray-300 p-4 mb-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
            {p.thumbnail && (
              <Image
                src={p.thumbnail.url}
                alt={p.title}
                width={p.thumbnail.width}
                height={p.thumbnail.height}
                className="w-full h-auto mb-2"
                priority={index === 0}
              />
            )}
            <div className="text-sm text-gray-500 mb-2">
              {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
            </div>
            <div className="mb-2">
              {Array.isArray(p.categories) &&
                p.categories.map((c) => (
                  <span
                    key={c.id}
                    className="text-xs border border-[#06c] text-[#06c] rounded px-2 py-1 mr-2"
                  >
                    {c.name}
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
