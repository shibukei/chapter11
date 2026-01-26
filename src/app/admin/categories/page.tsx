"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateButton from "../_components/CreateButton";
import { LoadingState } from "../_components/LoadingState";

type Category = {
  id: number;
  name: string;
};

type ApiResponse = {
  categories: Category[];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data : ApiResponse = await res.json();
        setCategories(data.categories ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, []);

  if (loading) return <LoadingState />;

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