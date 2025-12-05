// src/hooks/useChatThread.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "../services/apiService";
import { initSocket, getSocket } from "../services/socket";
import type { ChatMessage } from "../types/chat";

export function useChatThread(threadId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const isMounted = useRef(true);

  const loadMessages = useCallback(async () => {
    const data = await apiGet<ChatMessage[]>(`/chat/messages/${threadId}`);
    if (data && isMounted.current) {
      setMessages(data);
    }
  }, [threadId]);

  useEffect(() => {
    isMounted.current = true;
    loadMessages();
    return () => {
      isMounted.current = false;
    };
  }, [loadMessages]);

  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    const setup = async () => {
      socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      socket.emit("joinThread", { threadId });

      const handleIncoming = (msg: ChatMessage) => {
        if (!isMounted.current) return;
        if (msg.threadId !== threadId) return;

        setMessages((prev) => [...prev, msg]);
      };

      socket.on("newMessage", handleIncoming);

      return () => {
        socket?.emit("leaveThread", { threadId });
        socket?.off("newMessage", handleIncoming);
      };
    };

    let cleanupPromise = setup();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [threadId]);

  const sendMessage = useCallback(
    (content: string) => {
      const socket = getSocket();
      if (!socket) return;

      socket.emit("sendMessage", {
        threadId,
        content,
      });
    },
    [threadId]
  );

  return {
    messages,
    sendMessage,
    reload: loadMessages,
  };
}
