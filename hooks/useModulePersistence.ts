"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLatestConversation } from "@/lib/api";
import { loadModuleState, saveModuleState } from "@/lib/moduleState";

interface UseModulePersistenceOptions<T> {
  module: string;
  state: T;
  enabled?: boolean;
  onRestore?: (saved: T) => void;
  onMongoRestore?: (data: {
    id: string;
    title?: string;
    messages: Array<{ role: string; content: string; id?: string }>;
  }) => void;
}

/**
 * Auto-saves module state to sessionStorage and restores on mount.
 * For signed-in users, also loads latest MongoDB conversation if no local state.
 */
export function useModulePersistence<T>({
  module,
  state,
  enabled = true,
  onRestore,
  onMongoRestore,
}: UseModulePersistenceOptions<T>) {
  const { data: session } = useSession();
  const restored = useRef(false);
  const skipNextSave = useRef(false);

  // Restore on mount
  useEffect(() => {
    if (!enabled || restored.current) return;
    restored.current = true;

    const saved = loadModuleState<T>(module);
    if (saved) {
      skipNextSave.current = true;
      onRestore?.(saved);
      return;
    }

    // Fallback: load latest from MongoDB for signed-in users
    if (session?.user?.email && onMongoRestore) {
      getLatestConversation(session.user.email, module)
        .then((res) => {
          if (res.data?.messages?.length) {
            skipNextSave.current = true;
            onMongoRestore(res.data);
          }
        })
        .catch(() => {});
    }
  }, [enabled, module, session?.user?.email, onRestore, onMongoRestore]);

  // Save on state change
  useEffect(() => {
    if (!enabled || !restored.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveModuleState(module, state);
  }, [module, state, enabled]);
}
