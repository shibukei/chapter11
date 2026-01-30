import FormInput from "./FormInput";
import Button from "./Button";

type CategoryFormProps = {
  formData: { name: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  submitting: boolean;
  isEdit?: boolean;
};

export default function CategoryForm({
  formData,
  onChange,
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
          name="name"
          value={formData.name}
          onChange={onChange}
          disabled={submitting}
          required
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