import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { verifyToken } from "./auth.js";
import { logger } from "./logger.js";

// Map of userId -> Set of connected sockets
const clients = new Map<number, Set<WebSocket>>();

export function setupWss(server: any) {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "", `http://localhost`);
    const token = url.searchParams.get("token");
    if (!token) { ws.close(4001, "Unauthorized"); return; }

    const payload = verifyToken(token);
    if (!payload) { ws.close(4001, "Invalid token"); return; }

    const userId = payload.id as number;
    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(ws);
    logger.info({ userId }, "WS client connected");

    ws.on("close", () => {
      clients.get(userId)?.delete(ws);
      if (clients.get(userId)?.size === 0) clients.delete(userId);
    });

    ws.on("error", (err) => logger.error({ err }, "WS error"));
    ws.send(JSON.stringify({ type: "connected", message: "Connecté aux notifications" }));
  });

  return wss;
}

export function pushNotification(userId: number, payload: object) {
  const sockets = clients.get(userId);
  if (!sockets) return;
  const data = JSON.stringify({ type: "notification", ...payload });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

export function broadcastToUsers(userIds: number[], payload: object) {
  for (const id of userIds) pushNotification(id, payload);
}
