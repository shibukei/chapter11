"use client";

import Link from "next/link";
import CreateButton from "../_components/CreateButton";
import { LoadingState } from "../_components/LoadingState";
import CategoryTag from "../_components/CategoryTag";
import { PostsResponse, ViewPost } from "@/types";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

export default function AdminPostsPage() {
  const { token } = useSupabaseSession();

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
    }).then((res) => res.json());

    const { data, error, isLoading } = useSWR<PostsResponse>(
      token ? "/api/admin/posts" : null,
      fetcher
    );

  const posts: ViewPost[] = (data?.posts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    createdAt: p.createdAt,
    categories: p.postCategories?.map((pc) => pc.category.name) ?? [],
  }));

  if (isLoading) return <LoadingState />;
  if (error) return <div>エラーが発生しました</div>;

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