"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingState } from "../../_components/LoadingState";
import FormInput from "../../_components/FormInput";
import Button from "../../_components/Button";

type Category = {
  id: number;
  name: string;
};

type FormData = {
  title: string;
  content: string;
  thumbnailUrl: string;
  categories: number[];
};

export default function AdminPostNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    thumbnailUrl: "https://placehold.jp/800x400.png",
    categories: [],
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          thumbnailUrl: formData.thumbnailUrl,
          categories: formData.categories.map((id) => ({ id })),
        }),
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

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <FormInput
            label="タイトル"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">内容</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24"
              required
            />
        </div>

        <div className="mb-6">
          <FormInput
            label="サムネイル URL"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            type="url"
            placeholder="https://placehold.jp/800x400.png"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">カテゴリー</label>
          <select
            value={formData.categories[0] ?? ""}
            onChange={(e) => {
              const categoryId = parseInt(e.target.value);
              if (categoryId) {
                setFormData((prev) => ({
                  ...prev,
                  categories: [categoryId],
                }));
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">カテゴリーを選択</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            作成
          </Button>
        </div>
      </form>
    </div>
  )
}