"use client";

import Link from "next/link";
import CreateButton from "../_components/CreateButton"; 
import { LoadingState } from "../_components/LoadingState";
import CategoryTag from "../_components/CategoryTag";
import { PostsResponse, ViewPost } from "@/types"; // 記事APIのレスポンス型と表示用の型をインポート
import { useFetch } from "@/app/_hooks/useFetch"; // データフェッチ用カスタムフックをインポート

export default function AdminPostsPage() {

  const { data, error, isLoading } = useFetch<PostsResponse>("/api/admin/posts");
  // ↑ 記事一覧APIからデータを取得

  const posts: ViewPost[] = (data?.posts ?? []).map((p) => ({
    // ↑ data.postsが存在すればそれを使い、なければから配列をセット
    // .map() で APIレスポンスを画面表示用の形にして posts に格納
    id: p.id, // 記事ID
    title: p.title, // 記事タイトル
    createdAt: p.createdAt, // 作成日時
    categories: p.postCategories?.map((pc) => pc.category.name) ?? [],
    // ↑ postCategoriesが存在すれば、各カテゴリーの名前だけを取り出した配列を作る
    // なければ空配列をセット
  }));

  if (isLoading) return <LoadingState />;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">記事一覧</h1>
        <CreateButton href="/admin/posts/new" />
      </div>

      <div className="divide-y divide-gray-300 border-b border-gray-300">
        {posts.map((p) => ( 
          <Link key={p.id} href={`/admin/posts/${p.id}`} className="block">
            {/* ↑ 各記事をクリックすると詳細ページへ遷移、keyはReactが差分管理するために必要 */}
            <div className="p-4 hover:bg-gray-100 cursor-pointer transition">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(p.createdAt).toLocaleDateString("ja-JP")}
                {/* ↑ 作成日時をDateオブジェクトに変換し、日本語形式（例：2026/2/22）で表示 */}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.categories.map((c) => ( 
                  <CategoryTag key={c} name={c} />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}