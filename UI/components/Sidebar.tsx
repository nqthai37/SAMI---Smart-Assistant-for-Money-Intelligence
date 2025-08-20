// File: components/Sidebar.tsx
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Sami</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            pathname === "/" ? "text-gray-900 bg-gray-100" : "text-gray-500"
          } hover:bg-gray-100`}
        >
          <Link href="/">
            <Users className="w-4 h-4" />
            Nhóm của tôi
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            pathname.startsWith("/settings") ? "text-gray-900 bg-gray-100" : "text-gray-500"
          } hover:bg-gray-100`}
        >
          <Link href="/settings">
            <Settings className="w-4 h-4" />
            Cài đặt
          </Link>
        </Button>
      </nav>
    </div>
  );
}