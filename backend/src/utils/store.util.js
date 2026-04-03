/**
 * store.util.js — Simple JSON File Persistence
 *
 * Provides read/write helpers for saving data to JSON files in the data/ directory.
 * No external dependencies — uses Node's built-in fs/promises.
 *
 * File layout:
 *   data/
 *     sessions/
 *       session-<id>.json     ← one file per conversation session
 *     pdf-context.json        ← last uploaded PDF text + metadata
 *     sessions-index.json     ← lightweight index of all sessions
 */

import fs from 'fs/promises';
import path from 'path';

const DATA_DIR      = path.resolve(process.env.DATA_DIR || 'data');
const SESSIONS_DIR  = path.join(DATA_DIR, 'sessions');
const PDF_FILE      = path.join(DATA_DIR, 'pdf-context.json');
const INDEX_FILE    = path.join(DATA_DIR, 'sessions-index.json');

// ── Bootstrap ─────────────────────────────────────────────────────────────────

/**
 * Creates all required directories. Call once at startup.
 */
export async function initStore() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

// ── Session (conversation) storage ───────────────────────────────────────────

/**
 * Save a full session to disk.
 * @param {string} sessionId
 * @param {{ id, title, createdAt, updatedAt, messages: Array }} session
 */
export async function saveSession(sessionId, session) {
  const file = sessionFilePath(sessionId);
  await writeJSON(file, session);
  await updateIndex(sessionId, session);
}

/**
 * Load a session from disk. Returns null if not found.
 * @param {string} sessionId
 */
export async function loadSession(sessionId) {
  return readJSON(sessionFilePath(sessionId));
}

/**
 * Returns the lightweight index of all sessions (no messages, just metadata).
 * @returns {Array<{ id, title, createdAt, updatedAt, messageCount }>}
 */
export async function listSessions() {
  const index = await readJSON(INDEX_FILE);
  if (!index) return [];
  // Sort newest first
  return Object.values(index).sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

/**
 * Delete a session file and remove it from the index.
 */
export async function deleteSession(sessionId) {
  // Remove from index
  const index = (await readJSON(INDEX_FILE)) || {};
  delete index[sessionId];
  await writeJSON(INDEX_FILE, index);

  // Delete the session file
  try {
    await fs.unlink(sessionFilePath(sessionId));
  } catch {
    // File may not exist — that's fine
  }
}

// ── PDF context storage ───────────────────────────────────────────────────────

/**
 * Persist the PDF context object to disk.
 * @param {{ filename, text, charCount, pageCount, uploadedAt }} ctx
 */
export async function savePdfContext(ctx) {
  await writeJSON(PDF_FILE, ctx);
}

/**
 * Load the PDF context from disk. Returns null if none saved.
 */
export async function loadPdfContext() {
  return readJSON(PDF_FILE);
}

/**
 * Delete the persisted PDF context.
 */
export async function deletePdfContext() {
  try {
    await fs.unlink(PDF_FILE);
  } catch {
    // Already gone — fine
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function sessionFilePath(sessionId) {
  return path.join(SESSIONS_DIR, `session-${sessionId}.json`);
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null; // File doesn't exist or is corrupt
  }
}

/**
 * Keep the index file up to date with lightweight session metadata.
 */
async function updateIndex(sessionId, session) {
  const index = (await readJSON(INDEX_FILE)) || {};
  index[sessionId] = {
    id:           session.id,
    title:        session.title,
    createdAt:    session.createdAt,
    updatedAt:    session.updatedAt,
    messageCount: session.messages.length,
  };
  await writeJSON(INDEX_FILE, index);
}
