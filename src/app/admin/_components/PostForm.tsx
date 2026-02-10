import Image from "next/image";
import FormInput from "./FormInput";
import Button from "./Button";
import { Category, PostFormData } from "@/types";
import { ChangeEvent } from "react";

type PostFormProps = {
  formData: PostFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  categories: Category[];
  submitting: boolean;
  isEdit?: boolean;
  handleImageChange?: (e: ChangeEvent<HTMLInputElement>) => Promise<void>; 
  thumbnailImageUrl?: string | null
};

export default function PostForm({
  formData,
  onChange,
  onSubmit,
  onDelete,
  categories,
  submitting,
  isEdit = false,
  handleImageChange,
  thumbnailImageUrl,
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
        <label
          htmlFor="thumbnailImageKey"
          className="block text-sm font-semibold mb-2"
        >
          サムネイルURL
        </label>
        <input type="file" id="thumbnailImageKey" onChange={handleImageChange} accept="image/*" />
          {thumbnailImageUrl && (
            <div className="mt-2">
              <Image
                src={thumbnailImageUrl}
                alt="thumbnail"
                width={400}
                height={400}
              />
            </div>
          )}
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