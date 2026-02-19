"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import CategoryForm from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm } from "react-hook-form";
import useSWR from "swr";

interface CategoryFormData {
  name: string;
}

interface CategoryResponse {
  category: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useSupabaseSession();
  const { register, handleSubmit, reset } = useForm<CategoryFormData>();
  const [submitting, setSubmitting] = useState(false);

  const fetcher = (url: string) => 
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
      }).then((res) => res.json());

  const { data, error, isLoading } = useSWR<CategoryResponse>(
    token ? `/api/admin/categories/${id}` : null,
    fetcher
  );

  // データ取得後にフォームに値をセット
  useEffect(() => {
    if (data?.category) {
      reset({ name: data.category.name });
    }
  }, [data, reset]);

  const onSubmit = async (formData: CategoryFormData) => {
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { 
          "Content-type": "application/json",
          Authorization: token!,
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
        headers: {
          Authorization: token!,
        },
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

  if (isLoading) return <LoadingState />;
  if (error) return <div>エラーが発生しました</div>;
  if (!data?.category) return <div>カテゴリーが見つかりません</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">カテゴリー編集</h1>
      <CategoryForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        onDelete={handleDelete}
        submitting={submitting}
        isEdit
      />
    </div>
  )
}