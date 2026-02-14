"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import CategoryForm from "../../_components/CategoryForm";
import { Category } from "@/types";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetcher = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        const data = await res.json();
        const c = data.category ?? data;
        setCategory(c);
        setFormData({ name: c.name });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { 
          "Content-type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ name: formData.name }),
      });

      if (res.ok) {
        alert("カテゴリーを更新しました")
        router.push("/admin/categories");
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
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("カテゴリーを削除しました")
        router.push("/admin/categories");
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

  if (loading) return <div>読み込み中...</div>;
  if (!category) return <LoadingState />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">カテゴリー編集</h1>
      <CategoryForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitting={submitting}
        isEdit
      />
    </div>
  )
}