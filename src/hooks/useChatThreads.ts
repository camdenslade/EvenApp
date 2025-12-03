import { useEffect, useState } from "react";
import { apiGet } from "../services/apiService";
import { initSocket, getSocket } from "../services/socket";

export function useChatThreads() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await apiGet<any[]>("/chat/threads");
    if (data) setThreads(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const setup = async () => {
      const socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      socket.on("new_message", () => {
        load();
      });
    };

    setup();
  }, []);

  return { threads, loading, reload: load };
}
