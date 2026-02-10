"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Post } from "../../../types";
import { supabase } from "@/app/_libs/supabase";
import { extractImageKey } from "@/app/_libs/utils"

// APIレスポンスの型（thumnailImageKeyで返ってくる）
type PostDetail = {
  id: number;
  title: string;
  content: string;
  thumbnailImageKey: string;
  createdAt: string;
  updatedAt: string;
  postCategories: { category: { id: number; name: string } }[]
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // API の構造に応じて data.post か data を使う
        const p:PostDetail = data.post ?? data;
        setPost(p);

        // thumbnailImageKey → 公開URLに変換
        if (p.thumbnailImageKey) {
          const { data: urlData } = supabase.storage
            .from("post_thumbnail")
            .getPublicUrl(extractImageKey(p.thumbnailImageKey));
          setThumbnailImageUrl(urlData.publicUrl);
        }
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
    <article className="max-w-700 mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {thumbnailImageUrl && (
        <Image 
          src={thumbnailImageUrl} 
          alt={post.title} 
          width={800}
          height={400}
          className="w-full mb-4" />
      )}
      <div className="text-sm text-gray-500 mb-4">
        {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
      </div>
      <div className="mb-4">
        {post.postCategories.map((pc) => (
            <span
              key={pc.category.id}
              className="text-xs border border-[#06c] text-[#06c] rounded px-2 py-1 mr-2"
            >
              {pc.category.name}
            </span>
          ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
