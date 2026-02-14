"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ name: formData.name }),
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
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}