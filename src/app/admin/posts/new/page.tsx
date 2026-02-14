"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm";
import { CreatePostRequest, Category, PostFormData } from "@/types"
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from 'uuid' // 固有IDを生成するライブラリ
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminPostNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession()
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnailImageKey, setThumbnailImageKey] = useState('');
  // Imageタグのsrcにセットする画像URLを持たせるstate
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    thumbnailUrl: "https://placehold.jp/800x400.png",
    categories: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return

    const fetcher = async () => {
      try {
        // カテゴリー一覧を取得
        const catRes = await fetch("/api/admin/categories", {
          headers: {
            'Authorization': token,
          },
        });
        const catData = await catRes.json();
        setCategories(catData.categories ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetcher()
  }, [token])


  useEffect (() => {
    if (!thumbnailImageKey) return

    const fetcher = async () => {
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("post_thumbnail")
        .getPublicUrl(thumbnailImageKey)

      setThumbnailImageUrl(publicUrl)
    }

    fetcher()
  }, [thumbnailImageKey])

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) {
      // 画像が選択されていないのでreturn
      return
    }

    const file = event.target.files[0] // 選択された画像を取得
    
    const filePath = `private/${uuidv4()}` // ファイルパスを指定

    // Supabaseに画像をアップロード
    const { data, error } = await supabase.storage
    .from('post_thumbnail') // ここでパケットを指定
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    // アップロードに失敗したらエラーを表示して終了
    if (error) {
      alert(error.message)
      return
    }

    // data.pathに、画像固有のkeyが入っているので、thumbnailImageKeyに格納する
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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body: CreatePostRequest = {
        ...formData,
        thumbnailUrl: thumbnailImageUrl ?? formData.thumbnailUrl,
        categories: formData.categories.map((id) => ({ id })),
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || "",
        },
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
        handleImageChange={handleImageChange}
        thumbnailImageUrl={thumbnailImageUrl}
      />
    </div>
  );
}