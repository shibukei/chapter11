"use client";

import Link from "next/link";
import React from "react";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";
import { supabase } from "../_libs/supabase";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await router.replace('/')
  }

  const { session, isLoading } = useSupabaseSession()

  return (
    <header className="items-center bg-[#333] text-white flex font-bold justify-between p-6">
      <Link href="/" className="text-white no-underline">
        Blog
      </Link>
      {!isLoading && (
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/admin/posts" className="">
                管理画面
              </Link>
              <button onClick={handleLogout}>ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/contact" className="text-white no-underline">
                お問い合わせ
              </Link>
              <Link href="/sign_in" className="text-white no-underline">
                ログイン
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header;