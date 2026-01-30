"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm";
import { Category, ApiPost, PostFormData } from "@/types";

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
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
          categories: p.postCategories?.map((pc: { category: Category }) => pc.category.id) ?? [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "categories") {
      const categoryId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        categories: categoryId ? [categoryId] : [],
      }));
    } else {
      setFormData((prev) => ({...prev,[name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });

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
      <PostForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        categories={categories}
        submitting={submitting}
        isEdit
      />
    </div>
  );
}
