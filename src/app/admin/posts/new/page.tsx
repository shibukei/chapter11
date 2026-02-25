"use client";

import { ChangeEvent, useEffect, useState } from "react"; // ChangeEvent: 入力変更イベントの型、useEffect: 副作用処理、useState: 状態管理
import { useRouter } from "next/navigation";
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm"; // 記事フォームコンポーネントをインポート
import {
  CreatePostRequest, // 記事作成APIに送るリクエストの型
  PostFormData, // フォームの入力値の型
  CategoriesApiResponse, // カテゴリー一覧APIのレスポンスの型
} from "@/types";
import { supabase } from "@/app/_libs/supabase"; // Supabaseクライアントをインポート（画像アップロードに使用）
import { v4 as uuidv4 } from "uuid"; // 固有ID（uuid）を生成するライブラリをインポート
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession"; // 認証トークン取得用フックをインポート
import { useFetch } from "@/app/_hooks/useFetch"; // データフェッチ用カスタムフックをインポート
import { useForm } from "react-hook-form";

export default function AdminPostNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [thumbnailImageKey, setThumbnailImageKey] = useState(""); // Supabaseに保存された画像のパス（key）を管理するstate
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null); 
  // ↑ Imageタグのsrcにセットする画像URLを持たせるstate（初期値はnull）

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    defaultValues: {
      title: "", // 記事タイトル（初期値は空文字）
      content: "", // 記事本文（初期値は空文字）
      thumbnailUrl: "https://placehold.jp/800x400.png", // サムネイル画像URL（初期値はプレースホルダー画像）
      categories: [] as number[], // 選択されたカテゴリーIDの配列（初期値は空配列）
    }
  });

  const { data: catData, isLoading } = useFetch<CategoriesApiResponse>("/api/admin/categories");
  // ↑ カテゴリー一覧APIからデータを取得（dataをcatDataという名前で受け取る）
  const categories = catData?.categories ?? []; // catDataのcategoriesが存在すればそれを使い、なければ空配列をセット

  useEffect(() => {
  // ↑ thumbnailImageKeyが変わった時に画像の公開URLを取得する副作用処理
    if (!thumbnailImageKey) return; // thumbnailImageKeyが空ならここで処理を終了

    const fetcher = async () => { // 非同期で公開URLを取得する関数を定義
      const {
        data: { publicUrl }, // Supabaseから公開URLを取得
      } = supabase.storage
        .from("post_thumbnail") // post_thumbnailバケットを指定
        .getPublicUrl(thumbnailImageKey); // keyに対応する公開URLを取得

      setThumbnailImageUrl(publicUrl); // 取得した公開URLをstateにセット
    };
    fetcher(); // 上で定義した関数を実行
  }, [thumbnailImageKey]); // thumbnailImageKeyが変わった時に実行

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>, // ファイル入力の変更イベントを受け取る
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) { // ファイル一覧がnullまたはundefindeなら または ファイルが1件も選択されていないなら
      return; // 画像が選択されていなければ処理を終了
    }

    const file = event.target.files[0]; // 選択された画像ファイルを取得
    const filePath = `private/${uuidv4()}`; // uuidv4()で固有IDを生成してファイルパスを作成

    const { data, error } = await supabase.storage
      .from("post_thumbnail") // post_thumbnailバケットを指定
      .upload(filePath, file, { // 指定したパスに画像をアップロード
        cacheControl: "3600", // キャッシュの有効期限を3600秒（1時間）に設定
        upsert: false, // 同じパスのファイルが存在しても上書きしない
      });

    if (error) { // アップロードに失敗した場合
      alert(error.message); // エラーメッセージを表示
      return; // 処理を終了
    }

    setThumbnailImageKey(data.path); // アップロード成功時、画像のパス（key）をstateにセット
  };

  const onSubmit = async (data: PostFormData) => {
    // ↑ フォーム送信時の処理を定義
    try {
      const body: CreatePostRequest = {
        ...data, // フォームの入力値をコピー
        thumbnailUrl: thumbnailImageUrl ?? data.thumbnailUrl, // 画像があればそのURL、なければデフォルト画像
        categories: data.categories.map((id) => ({ id })), // カテゴリーIDをオブジェクトの配列に変換
      };

      const res = await fetch("/api/admin/posts", { // 記事作成APIにリクエスト
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ボディがJSON形式であることを指定
          "Authorization": token || "", // 認証トークンをヘッダーにセット（なければ空文字）
        },
        body: JSON.stringify(body), // bodyをJSON文字列に変換して送信
      });

      if (res.ok) {
        alert("記事を作成しました");
        router.push("/admin/posts");
      } else {
        alert("作成に失敗しました");
      }
    } catch (e) { // 予期せぬエラーが発生した場合
      console.error(e);
      alert("エラーが発生しました");
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">記事作成</h1>
      <PostForm
        register={register} 
        errors={errors} 
        onSubmit={handleSubmit(onSubmit)} // 送信時の処理を渡す
        categories={categories} // カテゴリー一覧を渡す
        submitting={isSubmitting} // 送信中かどうかの状態を渡す
        handleImageChange={handleImageChange} // 画像変更時の処置を渡す
        thumbnailImageUrl={thumbnailImageUrl} // サムネイル画像URLを渡す
      />
    </div>
  );
}
