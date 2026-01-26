"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import FormInput from "../../_components/FormInput";
import Button from "../../_components/Button";

type Category = {
  id: number;
  name: string;
};

type FormData = {
  name: string;
};

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        const data = await res.json();
        const c = data.category ?? data;
        setCategory(c);
        setFormData({
          name: c.name,
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
    e: React.ChangeEvent<HTMLInputElement>
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
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (res.ok) {
        alert("記事を更新しました")
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
        alert("記事を削除しました")
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

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <FormInput
            label="カテゴリー名"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "更新中..." : "更新"}
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
  )
}