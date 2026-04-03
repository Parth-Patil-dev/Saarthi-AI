/**
 * notes.service.js — Notes Generation & Persistence
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import { getPdfContext } from './pdf.service.js';
import { initStore } from '../utils/store.util.js';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.util.js';
import { createError } from '../utils/error.util.js';

const AI_MODE  = process.env.AI_MODE || 'mock';
const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// ── Persistence helpers ───────────────────────────────────────────────────────

async function readAllNotes() {
  try {
    const raw = await fs.readFile(NOTES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAllNotes(notes) {
  await initStore();
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

function generateId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * AI-generate notes for a subject + chapter.
 */
export async function generateNotes({ subject, chapter, style }) {
  const styleGuide = {
    concise:   'short bullet points, key terms bolded, no fluff',
    detailed:  'detailed paragraphs covering all subtopics thoroughly',
    outline:   'hierarchical outline with headings and sub-bullets',
  }[style] || 'clear bullet points with headings per subtopic';

  const system = `You are an expert teacher. Generate well-structured study notes. Respond with clean, readable notes only — no preamble.`;
  const prompt =
    `Generate comprehensive study notes for:\n` +
    `Subject: ${subject}\n` +
    `Chapter: ${chapter}\n` +
    `Style: ${styleGuide}\n\n` +
    `Include: key concepts, definitions, important points, and examples where helpful.`;

  logger.info(`[Notes] Generating notes: ${subject} / ${chapter} (${style})`);
  const content = await callModel(system, [{ role: 'user', content: prompt }]);

  return saveNote({
    title:   `${chapter} — ${subject}`,
    subject,
    chapter,
    content,
    source:  'ai-generated',
    style,
  });
}

/**
 * Summarise the currently loaded PDF into notes.
 */
export async function summarisePdfToNotes() {
  const pdf = getPdfContext();
  if (!pdf) throw createError('No PDF uploaded. Upload a PDF first via POST /api/upload.', 400);

  const MAX_CHARS = 4000;
  const snippet   = pdf.text.length > MAX_CHARS
    ? pdf.text.slice(0, MAX_CHARS) + '\n[...truncated...]'
    : pdf.text;

  const system = `You are an expert teacher. Summarise the provided text into clear, structured study notes.`;
  const prompt =
    `Summarise the following document into well-organised study notes.\n` +
    `Document: "${pdf.filename}"\n\n` +
    `--- CONTENT ---\n${snippet}\n--- END ---\n\n` +
    `Format: use headings, bullet points, and highlight key terms. Be thorough but concise.`;

  logger.info(`[Notes] Summarising PDF: ${pdf.filename}`);
  const content = await callModel(system, [{ role: 'user', content: prompt }]);

  return saveNote({
    title:   `Summary — ${pdf.filename}`,
    subject: 'PDF',
    chapter: pdf.filename,
    content,
    source:  'pdf-summary',
    style:   'summary',
  });
}

/**
 * Manually create and save a note.
 */
export async function createManualNote({ title, subject, chapter, content }) {
  if (!title?.trim())   throw createError('"title" is required.', 400);
  if (!content?.trim()) throw createError('"content" is required.', 400);

  return saveNote({
    title:   title.trim(),
    subject: subject?.trim() || '',
    chapter: chapter?.trim() || '',
    content: content.trim(),
    source:  'manual',
    style:   'manual',
  });
}

/**
 * Return all notes sorted newest first.
 */
export async function listNotes() {
  const all = await readAllNotes();
  return Object.values(all).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Return a single note by id.
 */
export async function getNoteById(id) {
  const all  = await readAllNotes();
  const note = all[id];
  if (!note) throw createError(`Note "${id}" not found.`, 404);
  return note;
}

/**
 * Delete a note by id.
 */
export async function deleteNote(id) {
  const all = await readAllNotes();
  if (!all[id]) throw createError(`Note "${id}" not found.`, 404);
  delete all[id];
  await writeAllNotes(all);
  logger.info(`[Notes] Deleted note: ${id}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function saveNote(fields) {
  const all  = await readAllNotes();
  const id   = generateId();
  const note = {
    id,
    ...fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all[id] = note;
  await writeAllNotes(all);
  logger.info(`[Notes] Saved note: "${note.title}" (${id})`);
  return note;
}

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
