"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FormInput from "../../_components/FormInput";
import { LoadingState } from "../../_components/LoadingState";
import Button from "../../_components/Button";

type Category = {
  id: number;
  name: string;
};

type ApiPost = {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  postCategories: { category: Category }[];
};

type FormData = {
  title: string;
  content: string;
  thumbnailUrl: string;
  categories: number[];
};

export default function AdminCategoriesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    thumbnailUrl: "",
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        // 記事データを取得
        const postRes = await fetch(`/api/admin/posts/${id}`);
        const postData = await postRes.json();
        const p = postData.post ?? postData;
        setPost(p);

        // カテゴリー一覧を取得
        const catRes = await fetch("/api/admin/categories");
        const catData = await catRes.json();
        setCategories(catData.categories ?? []);

        // フォームデータを設定
        setFormData({
          title: p.title,
          content: p.content,
          thumbnailUrl: p.thumbnailUrl,
          categories:
            p.postCategories?.map(
              (pc: { category: Category }) => pc.category.id,
            ) ?? [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
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
        alert("記事を更新しました")
        router.push("/admin/posts");
      } else {
        alert("更新に失敗しました");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("削除してもよろしいですか？")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("記事を削除しました")
        router.push("/admin/posts");
      } else {
        alert("削除に失敗しました");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!post) return <div>記事が見つかりません</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">記事編集</h1>

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
            placeholder="https://placehold.jp/800x400.png"
            onChange={handleChange}
            required
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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            更新
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            variant="danger"
          >
            削除
          </Button>
        </div>
      </form>
    </div>
  );
}
