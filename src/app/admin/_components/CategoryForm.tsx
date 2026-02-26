import Button from "./Button";
import { FieldErrors, UseFormRegister } from "react-hook-form";
// ↑ FiledErrors: バリデーションエラーの型、UseFormRegister: register関数の方をインポート
import FormInput from "./FormInput"; 

interface CategoryFormData {
  name: string;
}

type CategoryFormProps = {
  register: UseFormRegister<CategoryFormData>; // 入力欄を登録する関数
  errors: FieldErrors<CategoryFormData>; // バリデーションエラーの情報
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  submitting: boolean;
  isEdit?: boolean;
};

export default function CategoryForm({
  register, // 入力欄を登録する関数を受け取る
  errors, // バリデーションエラーの情報を受け取る
  onSubmit,
  onDelete,
  submitting,
  isEdit = false,
}: CategoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <div className="mb-6">
        <FormInput
          label="カテゴリー名"
          registration={register("name", { required: "カテゴリー名を入力してください"})}
          // ↑ "name"フィールドを登録、未入力の場合はエラーメッセージを表示
        />
        {errors.name && (
          // ↑ errors.nameが存在する（バリデーションエラーがある）場合のみ表示
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? "更新中..." : "作成中...") : (isEdit ? "更新" : "作成")}
          {/* ↑ 送信中かどうか・編集モードかどうかでボタンのテキストを切り替え
              submitting=true かつ isEdit=true → "更新中..."
              submitting=true かつ isEdit=true → "作成中..."
              submitting=false かつ isEdit=true → "更新"
              submitting=false かつ isEdit=false → "作成" */}
        </Button>
        {isEdit && onDelete && (
        // ↑ 編集モード かつ onDeliteが存在する場合のみ削除ボタンを表示
          <Button
            type="button" // submitではなくbuttonとして使う（フォーム送信を防ぐ）
            onClick={onDelete}
            disabled={submitting}
            variant="danger" // 危険な捜査を示す赤いボタン
          >
            削除
          </Button>
        )}
      </div>
    </form>
  );
}