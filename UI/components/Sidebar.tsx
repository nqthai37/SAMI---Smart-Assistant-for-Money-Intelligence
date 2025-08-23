// File: components/Sidebar.tsx
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Team } from "@/types/user";
import { useTeam } from "@/contexts/TeamContext"; 


export function Sidebar() { 
  const pathname = usePathname();
  const [teams, setTeams] = useState<Team[]>([]);
  const { selectTeam } = useTeam(); 

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get("/user/teams");
        setTeams(res.data || []);
      } catch (err: any) {
        toast.error("Không thể tải danh sách nhóm: " + err.message);
      }
    };
    fetchTeams();
  }, []);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Sami</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Nhóm của tôi */}
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

        {/* Cài đặt */}
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

        {/* Danh sách team */}
        <div className="pt-4 border-t border-gray-200 space-y-1">
          {teams.map((team) => (
            <Button
              key={team.id}
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-gray-100"
              onClick={() => selectTeam(team)} 
            >
              {team.teamName}
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
