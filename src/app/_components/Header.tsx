"use client";

import React from "react";
import Link from "next/link";

const Header: React.FC = () => {

  return (
    <header className="items-center bg-[#333] text-white flex font-bold justify-between p-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex gap-6 justify-between w-full">
          <Link href="/" className="text-white no-underline">Blog</Link>
          <Link href="/contact" className="text-white no-underline">お問い合わせ</Link>
        </div>
      </div>
    </header>
  )
}

export default Header;