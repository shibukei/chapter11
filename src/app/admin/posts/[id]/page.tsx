"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm";
import { Category, ApiPost, PostFormData } from "@/types";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from 'uuid'
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { extractImageKey } from "@/app/_libs/utils";

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnailImageKey, setThumbnailImageKey] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    thumbnailUrl: "",
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return

    const fetcher = async () => {
      try {
        // 記事データを取得
        const postRes = await fetch(`/api/admin/posts/${id}`, {
          headers: {
            'Authorization': token,
          },
        });
        const postData = await postRes.json();
        const p = postData.post ?? postData;
        setPost(p);
        setThumbnailImageKey(extractImageKey(p.thumbnailImageKey));

        // カテゴリー一覧を取得
        const catRes = await fetch("/api/admin/categories", {
          headers: {
            'Authorization': token,
          },
        });
        const catData = await catRes.json();
        setCategories(catData.categories ?? []);

        // フォームデータを設定
        setFormData({
          title: p.title,
          content: p.content,
          thumbnailUrl: p.thumbnailImageKey,
          categories: p.postCategories?.map((pc: { category: Category }) => pc.category.id) ?? [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [id, token]);

  // 画像URLを取得
  useEffect(() => {
    if (!thumbnailImageKey) return;

    const fetcher = async () => {
      const {
          data: { publicUrl },
        } = await supabase.storage
          .from("post_thumbnail")
          .getPublicUrl(thumbnailImageKey);

      setThumbnailImageUrl(publicUrl);
    };

      fetcher();
  }, [thumbnailImageKey]);

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const filePath = `private/${uuidv4()}`;

    const { data, error } = await supabase.storage
      .from("post_thumbnail")
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setThumbnailImageKey(data.path)
  }

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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || "",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          thumbnailUrl: thumbnailImageKey,
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
        headers: {
          "Authorization": token || "",
        },
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
      <PostForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        categories={categories}
        submitting={submitting}
        isEdit
        handleImageChange={handleImageChange}
        thumbnailImageUrl={thumbnailImageUrl}
      />
    </div>
  );
}
