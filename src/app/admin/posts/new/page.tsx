"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm";
import {
  CreatePostRequest,
  Category,
  PostFormData,
  CategoriesApiResponse,
} from "@/types";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from "uuid"; // 固有IDを生成するライブラリ
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

export default function AdminPostNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [thumbnailImageKey, setThumbnailImageKey] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(
    null,
  ); // Imageタグのsrcにセットする画像URLを持たせるstate
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    thumbnailUrl: "https://placehold.jp/800x400.png",
    categories: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
    }).then((res) => res.json());

  const { data: catData, isLoading } = useSWR<CategoriesApiResponse>(
    token ? "/api/admin/categories" : null,
    fetcher,
  );

  const categories = catData?.categories ?? [];

  useEffect(() => {
    if (!thumbnailImageKey) return;

    const fetcher = async () => {
      const {
        data: { publicUrl },
      } = supabase.storage
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
      // 画像が選択されていないのでreturn
      return;
    }

    const file = event.target.files[0]; // 選択された画像を取得
    const filePath = `private/${uuidv4()}`; // ファイルパスを指定

    // Supabaseに画像をアップロード
    const { data, error } = await supabase.storage
      .from("post_thumbnail") // ここでパケットを指定
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    // アップロードに失敗したらエラーを表示して終了
    if (error) {
      alert(error.message);
      return;
    }

    // data.pathに、画像固有のkeyが入っているので、thumbnailImageKeyに格納する
    setThumbnailImageKey(data.path);
  };

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
        alert("記事を作成しました");
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

  if (isLoading) return <LoadingState />;

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
