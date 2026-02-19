"use client"

import Link from "next/link";
import CreateButton from "../_components/CreateButton";
import { LoadingState } from "../_components/LoadingState";
import { Category, CategoriesApiResponse } from "@/types";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

export default function AdminCategoriesPage() {
  const { token } = useSupabaseSession();

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
    }).then((res) => res.json());

  const { data, error, isLoading } = useSWR<CategoriesApiResponse>(
    token ? "/api/admin/categories" : null,
    fetcher
  );

  const categories = data?.categories ?? [];

  if (isLoading) return <LoadingState />;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">カテゴリー一覧</h1>
        <CreateButton href="/admin/categories/new" />
      </div>

      <div className="divide-y divide-gray-300 border-b border-gray-300">
        {categories.map((c) => (
          <Link key={c.id} href={`/admin/categories/${c.id}`} className="block">
            <div className="p-4 flex justify-between items-center hover:bg-gray-100 transition">
              <div className="font-semibold">{c.name}</div>
              <div className="flex gap-2">
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}