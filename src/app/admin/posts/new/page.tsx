"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm";
import { CreatePostRequest, Category, PostFormData } from "@/types"

export default function AdminPostNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    thumbnailUrl: "https://placehold.jp/800x400.png",
    categories: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        // カテゴリー一覧を取得
        const catRes = await fetch("/api/admin/categories");
        const catData = await catRes.json();
        setCategories(catData.categories ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "categories") {
      const categoryId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        categories: categoryId ? [categoryId] : [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body: CreatePostRequest = {
        title: formData.title,
        content: formData.content,
        thumbnailUrl: formData.thumbnailUrl,
        categories: formData.categories.map((id) => ({ id })),
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("記事を作成しました")
        router.push("/admin/posts");
      } else {
        alert("作成に失敗しました");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">記事作成</h1>
      <PostForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        categories={categories}
        submitting={submitting}
      />
    </div>
  );
}