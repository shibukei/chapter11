"use client";

import { ChangeEvent, useEffect, useState } from "react"; // ChangeEvent: 入力変更イベントの型
import { useParams, useRouter } from "next/navigation"; // useParams: URLパラメータ取得、useRouter: ページ遷移用フック
import { LoadingState } from "../../_components/LoadingState";
import PostForm from "../../_components/PostForm"; // 記事フォーム
import { Category, ApiPost, PostFormData, CategoriesApiResponse } from "@/types";
import { supabase } from "@/app/_libs/supabase"; // Supabaseクライアント（画像アップロードに使用）
import { v4 as uuidv4 } from 'uuid' // 固有ID（UUID）を生成するライブラリ
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession"; // 認証トークン取得用フック
import { extractImageKey } from "@/app/_libs/utils"; // 画像URLからキーを取り出すユーティリティ関数
import { useForm } from "react-hook-form"; // フォームの状態管理ライブラリ
import { useFetch } from "@/app/_hooks/useFetch"; // データフェッチ用カスタムフック

interface PostApiResponse {
  post: ApiPost; // 記事APIのレスポンスの型
}

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>(); // URLパラメータから記事IDを取得（例；/posts/3/ → id = "3"）
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [thumbnailImageKey, setThumbnailImageKey] = useState(''); // Supabaseに保存された画像のパス（key）を管理するstate
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null); // 画像の公開URLを管理するstate（初期値はnull）
  const [submitting, setSubmitting] = useState(false)
  const {register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>();
  // ↑ useFormからフォーム操作に必要な関数・状態を取得
  // register: 入力値を登録する関数
  // handleSubmit: 送信時にバリデーションを実行してonSubmitを呼ぶ関数
  // reset: フォームの値をリセット（または上書き）する関数
  // errors: バリデーションエラーの情報
  // isSubmitting: 送信中かどうかの状態（useFormが自動管理）

  const { data: postData, error: postError, isLoading: postLoading } = useFetch<PostApiResponse>(`/api/admin/posts/${id}`);
  // ↑ 該当記事のAPIからデータを取得（dataをpostdata、errorをpostError、isLoadingをpostLoadingという名前で受け取る）
  const { data: catData, isLoading: catLoading } = useFetch<CategoriesApiResponse>("/api/admin/categories");
  // ↑ カテゴリー一覧APIからデータを取得

  const post: ApiPost | null = postData?.post ?? null; // postDataのpostが存在すればそれを使い、なければnullをセット
  const categories = catData?.categories ?? []; // catDataのcategoriesが存在すればそれを使い、なければ空配列をセット

  // データ取得時にフォームデータをセット
  useEffect(() => {
    if (!post) return; // postが存在しなければ処理を終了
    setThumbnailImageKey(extractImageKey(post.thumbnailImageKey)); // 画像URLからキーを取り出してstateにセット
    reset({ // フォームに既存の値をセット
      title: post.title, //記事タイトルをセット
      content: post.content, // 記事本文をセット
      thumbnailUrl: post.thumbnailImageKey, // サムネイル画像をセット
      categories: post.postCategories?.map((pc: { category: Category }) => pc.category.id) ?? [],
      // ↑ postCategoriesが存在すれば、各カテゴリーのIDだけを取り出した配列をセット、なければ空配列
    });
  }, [post, reset]); // postまたはresetが変わった時に実行

  // 画像URLを取得
  useEffect(() => {
    if (!thumbnailImageKey) return; // thumbnailImageKeyが空なら処理を終了

    const { data: { publicUrl } } = supabase.storage
      .from("post_thumbnail") // post_thumbnailバケットを終了
      .getPublicUrl(thumbnailImageKey); // keyに対応する公開URLを取得

    setThumbnailImageUrl(publicUrl); // thumbnailImageKeyが変わった時に実行
  }, [thumbnailImageKey]);

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>, // ファイル入力の変更イベントを受け取る
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) { // ファイル一覧がnullまたはundefindeなら または ファイルが1件も選択されていないなら
      return; // 画像が選択されていれば処理を終了
    }

    const file = event.target.files[0]; // 選択された画像ファイルを取得
    const filePath = `private/${uuidv4()}`; // uuidv4()で固有IDを生成してファイルパスを作成

    const { data, error } = await supabase.storage
      .from("post_thumbnail") // 保存先のパケット（フォルダ）を指定
      .upload(filePath, file, { // ファイルをアップロード
        cacheControl: '3600', // キャッシュの有効期限を3600秒（1時間）に設定
        upsert: false, // 同じパスのファイルが存在しても上書きしない
      });

    if (error) { // アップロードに失敗した場合
      alert(error.message);
      return;
    }

    setThumbnailImageKey(data.path) // アップロード成功時、画像なパス（key）をstateにセット
  }

  const onSubmit = async (data: PostFormData) => { // フォーム送信時の処理を定義（dataに入力値が入る）
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { // 該当記事のAPIにリクエスト
        method: "PUT", // 更新なのでPUTメソッドを使用
        headers: { 
          "Content-Type": "application/json", // ボディがJSON系であることを指定
          "Authorization": token || "", // 認証トークンをヘッダーにセット
        },
        body: JSON.stringify({
          title: data.title, // 記事タイトルをJSON文字列に変換して送信
          content: data.content, // 記事本文をJSON文字列に変換して送信
          thumbnailUrl: thumbnailImageKey, // 画像のパスをJSON文字列に変換して送信
          categories: data.categories.map((id) => ({ id })), // カテゴリーIDをオブジェクトの配列に変換して送信
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
    }
  };

  const handleDelete = async () => {
    if (!confirm("削除してもよろしいですか？")) return; // 確認ダイアログでキャンセルなら処理を中断
    setSubmitting(true); // 送信中フラグ

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

  if (postLoading || catLoading) return <LoadingState />;
  if (postError) return <div>エラーが発生しました</div>
  if (!post) return <div>記事が見つかりません</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">記事編集</h1>
      <PostForm
        register={register} // 入力欄を登録する関数を渡す
        errors={errors} // バリデーションエラーの情報を渡す
        onSubmit={handleSubmit(onSubmit)} // 送信時にバリデーション→onSubmitを実行
        onDelete={handleDelete}
        categories={categories} // カテゴリー一覧を渡す
        submitting={isSubmitting || submitting} // useFormの送信中 または 削除の送信中なら true
        isEdit
        handleImageChange={handleImageChange} // 画像変更時の処理を渡す
        thumbnailImageUrl={thumbnailImageUrl} // サムネイル画像URLを渡す
      />
    </div>
  );
}
