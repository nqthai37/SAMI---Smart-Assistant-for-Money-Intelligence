"use client"

import { ChevronDown, Crown, Shield, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { UserRole, UserMode } from "@/types/user"

interface RoleSwitcherProps {
  teamName: string
  actualRole: UserRole
  currentMode: UserMode
  onModeChange: (mode: UserMode) => void
}

export function RoleSwitcher({ teamName, actualRole, currentMode, onModeChange }: RoleSwitcherProps) {
  const roleConfig = {
    Owner: { icon: Crown, color: "text-purple-600", label: "Owner" },
    Admin: { icon: Shield, color: "text-blue-600", label: "Admin" },
    Deputy: { icon: Star, color: "text-green-600", label: "Deputy" },
    Member: { icon: User, color: "text-gray-600", label: "Member" },
  }

  actualRole = actualRole.slice(0, 1).toUpperCase() + actualRole.slice(1) as UserRole;
  currentMode = currentMode.slice(0, 1).toUpperCase() + currentMode.slice(1) as UserRole;

  // THÊM KIỂM TRA AN TOÀN
  const safeCurrentMode = currentMode || actualRole;

  // Role hierarchy: Owner > Admin > Deputy > Member
  const roleHierarchy: UserRole[] = ["Owner", "Admin", "Deputy", "Member"]

  // Get available modes based on actual role (can switch to lower roles)
  const getAvailableModes = (): UserMode[] => {
    const currentRoleIndex = roleHierarchy.indexOf(actualRole)
    let modes = roleHierarchy.slice(currentRoleIndex)

    if (actualRole === "Owner") {
      modes = modes.filter((mode) => mode !== "Owner")
      if (!modes.includes("Admin")) {
        modes.unshift("Admin")
      }
    }
    return modes
  }

  const availableModes = getAvailableModes()
  const currentConfig = roleConfig[safeCurrentMode] // SỬA ĐÂY
  
  // THÊM KIỂM TRA FALLBACK
  if (!currentConfig) {
    console.error('❌ Invalid role configuration:', { actualRole, currentMode: safeCurrentMode });
    return null;
  }
  
  const CurrentIcon = currentConfig.icon

  // Determine the label to display in the trigger button
  const triggerLabel = actualRole === "Owner" && safeCurrentMode === "Owner" ? "Admin" : currentConfig.label

  if (availableModes.length <= 1 && !(actualRole === "Owner" && safeCurrentMode === "Owner")) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <CurrentIcon className={`w-4 h-4 mr-2 ${currentConfig.color}`} />
          View as {triggerLabel}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableModes.map((mode) => {
          const config = roleConfig[mode]
          const Icon = config.icon
          const itemLabel = actualRole === "Owner" && mode === "Owner" ? "Admin" : config.label

          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => onModeChange(mode)}
              className={safeCurrentMode === mode ? "bg-gray-100" : ""} // SỬA ĐÂY
            >
              <Icon className={`w-4 h-4 mr-2 ${config.color}`} />
              View as {itemLabel}
              {mode === actualRole && <span className="ml-2 text-xs text-gray-500">(Your role)</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
