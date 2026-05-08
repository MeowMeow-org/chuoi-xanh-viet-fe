import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

let socketSingleton: Socket | null = null;

function resolveSocketBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!apiUrl) return "";
  return apiUrl.replace(/\/v1\/api\/?$/, "");
}

export function getChatSocket() {
  if (socketSingleton) return socketSingleton;

  socketSingleton = io(resolveSocketBaseUrl(), {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    autoConnect: false,
    withCredentials: true,
  });

  return socketSingleton;
}

export function connectChatSocketWithToken() {
  const socket = getChatSocket();
  const token = useAuthStore.getState().accessToken;

  if (!token) return socket;

  // Keep auth token updated before connect/reconnect.
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}
