import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SESSION_FILE = resolve(process.cwd(), "sessions.json");

function loadSessions() {
  try {
    if (existsSync(SESSION_FILE)) {
      return JSON.parse(readFileSync(SESSION_FILE, "utf8"));
    }
  } catch {
    // ignore
  }
  return {};
}

function saveSessions(sessions) {
  writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

export class FileSessionStorage {
  async storeSession(session) {
    const sessions = loadSessions();
    sessions[session.id] = session.toObject ? session.toObject() : session;
    saveSessions(sessions);
    return true;
  }

  async loadSession(id) {
    const sessions = loadSessions();
    const data = sessions[id];
    if (!data) return undefined;
    return data;
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
    return Object.values(sessions).filter((s) => s.shop === shop);
  }
}
