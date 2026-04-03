/**
 * notes.controller.js — Notes Request Handlers
 */

import {
  generateNotes,
  summarisePdfToNotes,
  createManualNote,
  listNotes,
  getNoteById,
  deleteNote,
} from '../services/notes.service.js';
import { createError } from '../utils/error.util.js';

// POST /api/notes/generate
// Body: { subject, chapter, style? }
export async function generateNotesHandler(req, res, next) {
  try {
    const { subject, chapter, style = 'concise' } = req.body;

    if (!subject?.trim()) return next(createError('"subject" is required.', 400));
    if (!chapter?.trim()) return next(createError('"chapter" is required.', 400));

    const validStyles = ['concise', 'detailed', 'outline'];
    if (!validStyles.includes(style))
      return next(createError(`"style" must be one of: ${validStyles.join(', ')}.`, 400));

    const note = await generateNotes({ subject: subject.trim(), chapter: chapter.trim(), style });
    res.status(201).json({ success: true, note });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// POST /api/notes/summarise
// No body needed — uses the currently uploaded PDF
export async function summariseHandler(req, res, next) {
  try {
    const note = await summarisePdfToNotes();
    res.status(201).json({ success: true, note });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// POST /api/notes
// Body: { title, subject?, chapter?, content }
export async function createNoteHandler(req, res, next) {
  try {
    const { title, subject, chapter, content } = req.body;
    const note = await createManualNote({ title, subject, chapter, content });
    res.status(201).json({ success: true, note });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/notes
export async function listNotesHandler(req, res, next) {
  try {
    const notes = await listNotes();
    res.status(200).json({ success: true, count: notes.length, notes });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/notes/:id
export async function getNoteHandler(req, res, next) {
  try {
    const note = await getNoteById(req.params.id);
    res.status(200).json({ success: true, note });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// DELETE /api/notes/:id
export async function deleteNoteHandler(req, res, next) {
  try {
    await deleteNote(req.params.id);
    res.status(200).json({ success: true, message: `Note deleted.` });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
