// src/hooks/useChatThreads.ts

// React ---------------------------------------------------------------
import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

// API -----------------------------------------------------------------
import { apiGet } from '../services/apiService';

// Realtime Socket -----------------------------------------------------
import { initSocket, getSocket } from '../services/socket';

// Types ---------------------------------------------------------------
import type { MatchThread } from '../types/chat';

// ====================================================================
// # useChatThreads
// ====================================================================
//
// Provides:
//   • Loads all message threads (conversations)
//   • Tracks loading state
//   • Subscribes to "threadUpdated" socket events
//   • Ensures safe unmounted cleanup
//
// When to use:
//   - On the "Messages" screen
//   - On any view that needs to show conversation previews
//

export function useChatThreads() {
  // All threads returned from backend
  const [threads, setThreads] = useState<MatchThread[]>([]);

  // Loading state for UI
  const [loading, setLoading] = useState(true);

  // Prevents setState after unmount
  const mounted = useRef(true);

  // ------------------------------------------------------------------
  // # LOAD THREADS FROM REST
  // ------------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);

    const data = await apiGet<MatchThread[]>('/chat/threads');

    if (mounted.current && Array.isArray(data)) {
      setThreads(data);
    }

    if (mounted.current) {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    mounted.current = true;
    void load();

    return () => {
      mounted.current = false;
    };
  }, [load]);

  // ------------------------------------------------------------------
  // # SOCKET: LISTEN FOR THREAD UPDATES
  // ------------------------------------------------------------------
  //
  // Server emits "threadUpdated" when:
  //   - A user sends a message
  //   - firstMessageAt updates (new conversation)
  //   - Profile/preview changes (optional future logic)
  //
  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    const setup = async () => {
      socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      const handler = () => {
        // Reload threads when notified
        void load();
      };

      socket.on('threadUpdated', handler);

      // Cleanup returned to the parent effect
      return () => {
        socket?.off('threadUpdated', handler);
      };
    };

    const cleanupPromise = setup();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [load]);

  // ------------------------------------------------------------------
  // # PUBLIC API
  // ------------------------------------------------------------------
  return {
    /** Array of conversation threads with preview data */
    threads,

    /** Loading state for initial fetch or refetch */
    loading,

    /** Manually reload threads */
    reload: load,
  };
}
