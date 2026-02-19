'use client'

import Link from "next/link";
import React from "react";
import { useRouteGuard } from "./_hooks/useRouteGuard";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/posts", label: "記事一覧" },
  { href: "/admin/categories", label: "カテゴリー一覧" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRouteGuard()

  const pathname = usePathname()
  const isSelected = (href: string) => {
    return pathname.includes(href)
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* サイドバー */}
      <aside className="w-64 border-r border-gray-50 bg-slate-50">
        <nav className="flex flex-col gap-1 mt-1 px-2 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-2 hover:bg-slate-200 ${
                isSelected(item.href) ? 'bg-slate-300 font-semibold' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインエリア */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}