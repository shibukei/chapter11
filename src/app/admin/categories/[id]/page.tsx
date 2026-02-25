"use client"

import { useEffect, useState } from "react"; // useEffect: 副作用処理、useState: 状態管理のフックをインポート
import { useParams, useRouter } from "next/navigation"; // useParams: URLパラメーター取得 useRouter: ページ遷移用フック
import { LoadingState } from "../../_components/LoadingState";
import CategoryForm from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession"; // 認証トークン取得用フックをインポート
import { useForm } from "react-hook-form"; // フォームの状態管理ライブラリをインポート
import { useFetch } from "@/app/_hooks/useFetch"; // データフェッチ用カスタムフックをインポート

// フォームの入力値を定義
interface CategoryFormData {
  name: string; 
}

// APIレスポンスの型を定義
interface CategoryResponse {
  category: {
    id: number; 
    name: string; 
    createdAt: Date; // 作成日時
    updatedAt: Date; // 更新日時
  };
}

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>(); // URLパラメータからカテゴリーIDを取得（例：/categories/3 → id = "3"）
  const router = useRouter();
  const { token } = useSupabaseSession();
  const [submitting, setSubmitting] = useState(false); // フォーム送信中かどうかの状態（初期値はfalse）
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormData>(); // フォーム操作に必要な関数を取得（handleDelete では isSubmitting が自動管理されないので注意が必要）

  const { data, error, isLoading } = useFetch<CategoryResponse>(`/api/admin/categories/${id}`);
  // ↑ 該当カテゴリーのAPIからデータを取得（URLにidを埋め込む）

  // データ取得後にフォームに値をセット
  useEffect(() => {
    if (data?.category) { // dataのcategoryが存在すれば
      reset({ name: data.category.name }); // フォームのカテゴリー名をセット
    }
  }, [data, reset]); // dataまたはresetが変わった時に実行

  const onSubmit = async (formData: CategoryFormData) => { // フォーム送信時の処理を定義
    setSubmitting(true); // 送信中フラグをtrueにする

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { // 該当カテゴリーAPIにリクエスト
        method: "PUT",
        headers: { 
          "Content-type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ name: formData.name }), // フォームの入力値をJSON文字列に変換してボディをセット
      });

      if (res.ok) { // レスポンスが成功（200~299）なら
        alert("カテゴリーを更新しました")
        router.push("/admin/categories");
      } else {
        alert("更新に失敗しました");
      }
    } catch (e) { // 通信エラーなど予期せぬエラーが発生した場合
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false); // 成功・失敗に関わらず送信中フラグをfalseに返す
    }
  };

  const handleDelete = async () => { // 削除ボタンクリック時の処理を定義
    if (!confirm("削除してもよろしいですか？")) return; // 確認ダイアログでキャンセルなら処理を中断

    setSubmitting(true); // 送信中フラグをtrueにする
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
        },
      });

      if (res.ok) {
        alert("カテゴリーを削除しました")
        router.push("/admin/categories");
      } else {
        alert("削除に失敗しました");
      }
    } catch (e) { // 予期せぬエラーが発生した場合
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false); // 成功・失敗に関わらず送信中フラグをfalseに返す
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <div>エラーが発生しました</div>;
  if (!data?.category) return <div>カテゴリーが見つかりません</div>; // データがない場合はメッセージを表示

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">カテゴリー編集</h1>
      <CategoryForm
        register={register} // フォームに入力値を登録する関数を返す
        errors={errors}
        onSubmit={handleSubmit(onSubmit)} // 送信時にonSubmitを実行（handleSubmitがバリデーションを担当）
        onDelete={handleDelete} // 削除ボタンのクリック時の処理を渡す
        submitting={isSubmitting || submitting} // 送信中かどうかの状態を渡す（どちらかがtrueなら無効化）
        isEdit // 編集モードであることを示すフラグ（trueを省略した書き方）
      />
    </div>
  )
}