"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MicroCmsPost } from "@/pp/_types/MicroCmsPost";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<MicroCmsPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://7h03f65xfg.microcms.io/api/v1/posts/${id}`,
          {
            headers: {
              'X-MICROCMS-API-KEY': process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
            },
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPost(data); // dataをそのままセット
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [id]);

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">エラー: {error}</div>;
  if (!post) return <div className="p-4">記事が見つかりません。</div>;

  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.thumbnail && (
        <Image
          src={post.thumbnail.url} 
          alt={post.title} 
          width={post.thumbnail.width} 
          height={post.thumbnail.height}
          className="w-full mb-4" />
      )}
      <div className="text-sm text-gray-500 mb-4">
        {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
      </div>
      <div className="mb-4">
        {Array.isArray(post.categories) &&
          post.categories.map((c) => (
            <span
              key={c.id}
              className="text-xs border border-[#06c] text-[#06c] rounded px-2 py-1 mr-2"
            >
              {c.name}
            </span>
          ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
