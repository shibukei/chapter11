"use client"

import Link from "next/link";
import CreateButton from "../_components/CreateButton"; 
import { LoadingState } from "../_components/LoadingState";
import { CategoriesApiResponse } from "@/types";
import { useFetch } from "@/app/_hooks/useFetch"; // データフェッチ用カスタムフック

export default function AdminCategoriesPage() {
  const { data, error, isLoading } = useFetch<CategoriesApiResponse>("/api/admin/categories");
  // ↑ カテゴリー一覧APIからデータを取得
  
  const categories = data?.categories ?? [];
  // ↑ data.categoriesが存在すればそれを使い、なければから配列をセット（??はnull/undefinedの時に代替値）

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
          {/* ↑ 各カテゴリーをクリックすると詳細ページへ遷移、keyはReactが差分管理するために必要 */}
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