// src/hooks/useChatThreads.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { apiGet } from "../services/apiService";
import { initSocket, getSocket } from "../services/socket";
import type { MatchThread } from "../types/chat";

export function useChatThreads() {
  const [threads, setThreads] = useState<MatchThread[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);

    const data = await apiGet<MatchThread[]>("/chat/threads");

    if (mounted.current && Array.isArray(data)) {
      setThreads(data);
    }

    if (mounted.current) setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    const setup = async () => {
      socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      const handler = () => {
        load();
      };

      socket.on("threadUpdated", handler);

      return () => {
        socket?.off("threadUpdated", handler);
      };
    };

    const cleanupPromise = setup();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [load]);

  return {
    threads,
    loading,
    reload: load,
  };
}
