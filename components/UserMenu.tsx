"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, History, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserMenuProps {
  collapsed?: boolean;
}

export default function UserMenu({ collapsed = false }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return (
      <div className="px-3 py-3 border-t border-white/5 animate-pulse">
        <div className="h-8 rounded-lg bg-white/5" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => signIn("google")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group ${collapsed ? "justify-center" : ""}`}
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.2)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,211,238,0.12)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 15px rgba(34,211,238,0.15)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,211,238,0.06)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
          title="Sign in with Google"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">
              Sign in with Google
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        style={{ background: open ? "rgba(255,255,255,0.06)" : "transparent" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
        onMouseLeave={e => (e.currentTarget.style.background = open ? "rgba(255,255,255,0.06)" : "transparent")}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden ring-1 ring-cyan-400/40"
          style={{ boxShadow: "0 0 8px rgba(34,211,238,0.3)" }}>
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-cyan-500/20 flex items-center justify-center">
              <User size={14} className="text-cyan-400" />
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold truncate" style={{ color: "var(--fg)" }}>
                {session.user?.name?.split(" ")[0]}
              </p>
              <p className="text-[9px] truncate" style={{ color: "var(--faint)" }}>
                {session.user?.email}
              </p>
            </div>
            <ChevronDown size={12} style={{ color: "var(--faint)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute bottom-full left-3 right-3 mb-2 rounded-xl overflow-hidden animate-fade-in z-50"
          style={{
            background: "rgba(10,12,24,0.98)",
            border: "1px solid rgba(34,211,238,0.2)",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(34,211,238,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[11px] font-bold text-white">{session.user?.name}</p>
            <p className="text-[10px] text-cyan-400/70">{session.user?.email}</p>
          </div>
          <Link
            href="/history"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
            style={{ color: "var(--muted)" }}
          >
            <History size={14} className="text-cyan-400" />
            <span className="text-[11px] font-medium">Chat History</span>
          </Link>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-red-500/10"
            style={{ color: "#f87171" }}
          >
            <LogOut size={14} />
            <span className="text-[11px] font-medium">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
