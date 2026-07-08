"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <form action={logout} className="mt-auto pt-4 border-t border-card-border">
      <button
        type="submit"
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-on-surface-variant hover:text-error transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </form>
  );
}
