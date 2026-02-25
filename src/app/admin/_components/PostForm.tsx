import Image from "next/image";
import FormInput from "./FormInput";
import Button from "./Button";
import { Category, PostFormData } from "@/types"; // カテゴリーの型と記事フォームデータの型
import { ChangeEvent } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form"; // バリデーションエラーの型とregister関数の型

type PostFormProps = {
  register: UseFormRegister<PostFormData>; // 入力欄を登録する関数
  errors: FieldErrors<PostFormData>; // バリデーションエラーの情報
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  categories: Category[]; // カテゴリーの一覧
  submitting: boolean; // 送信中かどうかの状態
  isEdit?: boolean;
  handleImageChange?: (e: ChangeEvent<HTMLInputElement>) => Promise<void>; // 画像変更時の処理
  thumbnailImageUrl?: string | null;
};

export default function PostForm({
  register, // 入力欄を登録する関数を受け取る
  errors, // バリデーションエラーの情報を受け取る
  onSubmit,
  onDelete,
  categories, // カテゴリーの一覧を受け取る
  submitting,
  isEdit = false,
  handleImageChange, // 画像変更時の処理を受け取る
  thumbnailImageUrl, // サムネイル画像のURLを受け取る
}: PostFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <div className="mb-6">
        <FormInput
          label="タイトル"
          registration={register("title", {
            required: "タイトルを入力してください",
          })}
          // ↑ "title"フィールドを登録、未入力の場合はエラーメッセージを表示
          disabled={submitting}
        />
        {errors.title && ( // タイトルのバリデーションエラーがある場合のみ表示
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">内容</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 h-24 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
          {...register("content", { required: "本文を入力してください" })}
          // ↑ "content"フィールドを登録、未入力の場合はエラーメッセージを表示
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="thumbnailImageKey" // input要素のidと紐づけてクリックで入力欄を開く
          className="block text-sm font-semibold mb-2"
        >
          サムネイルURL
        </label>
        <input
          type="file" // ファイル選択の入力欄
          id="thumbnailImageKey" // labelのhtmlForと紐づけるためのid
          onChange={handleImageChange} // 画像が選択された時の処理
          accept="image/*" // 画像ファイルのみ選択可能に制限
        />
        {thumbnailImageUrl && ( // サムネイル画像のURLが存在する場合のみ表示
          <div className="mt-2">
            <Image
              src={thumbnailImageUrl} // 画像のURLをセット
              alt="thumbnail" // 画像の代替テキスト
              width={400}
              height={400}
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">カテゴリー</label>
        <select
          {...register("categories")} // "categories"フィールドを登録
          className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          <option value="">カテゴリーを選択</option>
          {categories.map((c) => ( // カテゴリーをループして選択肢を表示
            <option key={c.id} value={c.id}> {/* keyはReactの差分管理、valueはカテゴリーID */}
              {c.name} {/* カテゴリー名を表示 */}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting // submittingがtrueなら
            ? isEdit // isEditがtrueなら
              ? "更新中..."
              : "作成中..." // isEditがfalseなら
            : isEdit // submittingがfalseなら、isEditがtrueなら
              ? "更新"
              : "作成"} {/* isEditがfalseなら */} 
        </Button>
        {isEdit && onDelete && ( // 編集モード かつ onDeleteが存在する場合のみ削除ボタンを表示
          <Button
            type="button" // submitではなくbuttonとして扱う（フォームの送信を防ぐ）
            onClick={onDelete} 
            disabled={submitting}
            variant="danger" // 危険な操作を示す赤いボタン
          >
            削除
          </Button>
        )}
      </div>
    </form>
  );
}
