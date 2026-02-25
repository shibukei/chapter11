'use client'

import useSWR from "swr" // データフェッチライブラリSWRをインポート
import { useSupabaseSession } from "./useSupabaseSession" // 認証トークンを取得するカスタムフックをインポート

// ジェネリック型<T>を使い、どんなレスポンス化にも対応できるカスタムフックを定義
export const useFetch = <T>(endpoint: string) => {
  const { token } = useSupabaseSession() 

  // SWRに渡すフェッチ関数を定義
  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json", // ボディがJSON形式であることを指定
        Authorization: token!, // 認証トークンをヘッダーにセット (!で非nullを保証)
      },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`) // 失敗時はエラーをスロー
        return res.json() // 成功時はJSONとしてパースして返す
    })

    return useSWR<T>(
      token && endpoint ? endpoint : null, // tokenとendpointが両方ある場合のみフェッチ
      fetcher, 
    )
}