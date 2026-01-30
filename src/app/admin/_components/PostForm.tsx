import FormInput from "./FormInput";
import Button from "./Button";
import { Category, PostFormData } from "@/types";

type PostFormProps = {
  formData: PostFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  categories: Category[];
  submitting: boolean;
  isEdit?: boolean;
};

export default function PostForm({
  formData,
  onChange,
  onSubmit,
  onDelete,
  categories,
  submitting,
  isEdit = false,
}: PostFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <div className="mb-6">
        <FormInput
          label="タイトル"
          name="title"
          value={formData.title}
          onChange={onChange}
          disabled={submitting}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">内容</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 h-24 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
          required
        />
      </div>

      <div className="mb-6">
        <FormInput
          label="サムネイル URL"
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={onChange}
          type="url"
          placeholder="https://placehold.jp/800x400.png"
          disabled={submitting}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">カテゴリー</label>
        <select
          value={formData.categories[0] ?? ""}
          onChange={onChange}
          name="categories"
          className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          <option value="">カテゴリーを選択</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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