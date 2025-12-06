// src/hooks/useChatThread.ts

// React ---------------------------------------------------------------
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

// API -----------------------------------------------------------------
import { apiGet } from '../services/apiService';

// Realtime Socket -----------------------------------------------------
import { initSocket, getSocket } from '../services/socket';

// Types ---------------------------------------------------------------
import type { ChatMessage } from '../types/chat';

// ====================================================================
// # useChatThread
// ====================================================================
//
// Provides:
//   • Initial load of messages via REST
//   • Real-time message updates via WebSocket
//   • Safe cleanup to prevent setState after unmount
//   • Simple sendMessage() wrapper
//
// Expected lifecycle:
//   1. On mount → fetch all messages
//   2. Connect to socket → join thread room
//   3. Listen for "newMessage" → append live updates
//   4. Cleanup → leave room + remove listeners
//

export function useChatThread(threadId: string) {
  // All messages for this thread
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Guards against setState after unmount
  const isMounted = useRef(true);

  // ------------------------------------------------------------------
  // # LOAD MESSAGES (REST)
  // ------------------------------------------------------------------
  const loadMessages = useCallback(async () => {
    const data = await apiGet<ChatMessage[]>(`/chat/messages/${threadId}`);

    if (data && isMounted.current) {
      setMessages(data);
    }
  }, [threadId]);

  // Load on mount / thread change
  useEffect(() => {
    isMounted.current = true;
    void loadMessages();

    return () => {
      isMounted.current = false;
    };
  }, [loadMessages]);

  // ------------------------------------------------------------------
  // # SOCKET CONNECTION + EVENTS
  // ------------------------------------------------------------------
  //
  // Steps:
  //   1. Ensure socket is initialized
  //   2. Join the thread room
  //   3. Listen for new messages
  //   4. Cleanup on unmount
  //
  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    const setup = async () => {
      // Connect or reuse existing connection
      socket = getSocket() ?? (await initSocket());
      if (!socket) return;

      // Join the room for this thread
      socket.emit('joinThread', { threadId });

      // Handle new messages from server
      const handleIncoming = (msg: ChatMessage) => {
        if (!isMounted.current) return;
        if (msg.threadId !== threadId) return;

        setMessages((prev) => [...prev, msg]);
      };

      socket.on('newMessage', handleIncoming);

      // Cleanup handler returned by setup()
      return () => {
        socket?.emit('leaveThread', { threadId });
        socket?.off('newMessage', handleIncoming);
      };
    };

    // Execute socket setup & cleanup logic
    let cleanupPromise = setup();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [threadId]);

  // ------------------------------------------------------------------
  // # SEND MESSAGE
  // ------------------------------------------------------------------
  //
  // Emits to WebSocket server:
  //   { threadId, content }
  //
  const sendMessage = useCallback(
    (content: string) => {
      const socket = getSocket();
      if (!socket) return;

      socket.emit('sendMessage', {
        threadId,
        content,
      });
    },
    [threadId],
  );

  // ------------------------------------------------------------------
  // # PUBLIC API
  // ------------------------------------------------------------------
  return {
    /** Array of chat messages for this thread */
    messages,

    /** Sends a socket message (does not update state until server confirms) */
    sendMessage,

    /** Reloads messages from REST endpoint */
    reload: loadMessages,
  };
}
