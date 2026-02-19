"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm } from "react-hook-form";

interface CategoryFormData {
  name: string;
}

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const { register, handleSubmit } = useForm<CategoryFormData>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ name: data.name }),
      });
      if (res.ok) {
        alert("カテゴリーを作成しました");
        router.push("/admin/categories");
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">カテゴリー作成</h1>
      <CategoryForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        submitting={submitting}
      />
    </div>
  );
}