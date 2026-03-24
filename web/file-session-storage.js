import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Session } from "@shopify/shopify-api";

const SESSION_FILE = resolve(process.cwd(), "sessions.json");

function loadSessions() {
  try {
    if (existsSync(SESSION_FILE)) {
      return JSON.parse(readFileSync(SESSION_FILE, "utf8"));
    }
  } catch {
  }
  return {};
}

function saveSessions(sessions) {
  writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

function toSession(data) {
  if (!data) return undefined;
  const session = new Session({
    id: data.id,
    shop: data.shop,
    state: data.state,
    isOnline: data.isOnline,
  });
  if (data.scope) session.scope = data.scope;
  if (data.accessToken) session.accessToken = data.accessToken;
  if (data.expires) session.expires = new Date(data.expires);
  return session;
}

function sessionToJson(session) {
  return {
    id: session.id,
    shop: session.shop,
    state: session.state,
    isOnline: session.isOnline,
    scope: session.scope || "read_products,write_products",
    accessToken: session.accessToken,
    expires: session.expires ? session.expires.toISOString() : undefined,
  };
}

export class FileSessionStorage {
  async storeSession(session) {
    const sessions = loadSessions();
    sessions[session.id] = sessionToJson(session);
    saveSessions(sessions);
    return true;
  }

  async loadSession(id) {
    const sessions = loadSessions();
    return toSession(sessions[id]);
  }

  async deleteSession(id) {
    const sessions = loadSessions();
    delete sessions[id];
    saveSessions(sessions);
    return true;
  }

  async deleteSessions(ids) {
    const sessions = loadSessions();
    for (const id of ids) {
      delete sessions[id];
    }
    saveSessions(sessions);
    return true;
  }

  async findSessionsByShop(shop) {
    const sessions = loadSessions();
    return Object.values(sessions)
      .filter((s) => s.shop === shop)
      .map(toSession)
      .filter(Boolean);
  }
}
