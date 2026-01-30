import Link from "next/link";
import React from "react";

const navItems = [
  { href: "/admin/posts", label: "記事一覧" },
  { href: "/admin/categories", label: "カテゴリー一覧" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 border-r border-gray-50 bg-slate-50">
        <nav className="flex flex-col gap-1 mt-1 px-2 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 hover:bg-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}