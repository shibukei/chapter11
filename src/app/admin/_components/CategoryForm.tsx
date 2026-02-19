import Button from "./Button";
import { UseFormRegister } from "react-hook-form";

interface CategoryFormData {
  name: string;
}

type CategoryFormProps = {
  register: UseFormRegister<CategoryFormData>;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  submitting: boolean;
  isEdit?: boolean;
};

export default function CategoryForm({
  register,
  onSubmit,
  onDelete,
  submitting,
  isEdit = false,
}: CategoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">カテゴリー名</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
          disabled={submitting}
          {...register("name", { required: true })}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? "更新中..." : "作成中...") : (isEdit ? "更新" : "作成")}
        </Button>
        {isEdit && onDelete && (
          <Button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            variant="danger"
          >
            削除
          </Button>
        )}
      </div>
    </form>
  );
}