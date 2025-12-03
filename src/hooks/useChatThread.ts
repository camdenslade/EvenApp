// src/hooks/useChatThread.ts
import { useEffect, useState, useCallback } from "react";
import { apiGet } from "../services/apiService";
import { initSocket, getSocket } from "../services/socket";
import type { ChatMessage } from "../types/chat";

export function useChatThread(threadId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadMessages = useCallback(async () => {
    const data = await apiGet<ChatMessage[]>(`/chat/messages/${threadId}`);
    if (data) setMessages(data);
  }, [threadId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    const setup = async () => {
      socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      const handler = (msg: ChatMessage) => {
        if (msg.threadId === threadId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on("new_message", handler);

      return () => {
        socket?.off("new_message", handler);
      };
    };

    const cleanupPromise = setup();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [threadId]);

  return {
    messages,
    reload: loadMessages,
  };
}
