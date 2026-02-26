"use client"

import { useRouter } from "next/navigation";
import CategoryForm from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession"; // 認証トークン取得用フック
import { useForm } from "react-hook-form"; // フォームの状態管理ライブラリ

// フォームの入力値の型を定義
interface CategoryFormData {
  name: string;
}

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryFormData>();
  // ↑ useFormからフォーム操作に必要な関数・状態を取得
  // register: 入力欄を登録する関数
  // handleSubmit: 送信時にバリデーションを実行してonSubmitを呼ぶ関数
  // errors: バリデーションエラーの情報
  // isSubmitting: 送信中かどうかの状態（useFormが自動管理）

  const onSubmit = async (data: CategoryFormData) => { // フォーム送信時の処理を定義（dataに入力値が入る）
    try {
      const res = await fetch("/api/admin/categories", { // カテゴリー作成APIにリクエスト
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ name: data.name }),
      });
      if (res.ok) { // レスポンスが成功（200〜299）なら
        alert("カテゴリーを作成しました");
        router.push("/admin/categories");
      } else {
        alert("作成に失敗しました");
      }
    } catch (e) { // 予期せぬエラーが発生した場合
      console.error(e);
      alert("エラーが発生しました");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">カテゴリー作成</h1>
      <CategoryForm
        register={register} // 入力欄を登録する関数を渡す
        errors={errors} 
        onSubmit={handleSubmit(onSubmit)} // 送信時にバリデーション→onSubmitを実行
        submitting={isSubmitting} // 送信中かどうかの状態を渡す（ボタンの非活性化などに使う）
      />
    </div>
  );
}