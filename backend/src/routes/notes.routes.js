/**
 * notes.routes.js — Notes API Routes
 */

import { Router } from 'express';
import {
  generateNotesHandler,
  summariseHandler,
  createNoteHandler,
  listNotesHandler,
  getNoteHandler,
  deleteNoteHandler,
} from '../controllers/notes.controller.js';

export const notesRouter = Router();

// AI generate notes from subject + chapter
notesRouter.post('/generate', generateNotesHandler);

// Summarise currently uploaded PDF into notes
notesRouter.post('/summarise', summariseHandler);

// Manually create a note
notesRouter.post('/', createNoteHandler);

// List all notes
notesRouter.get('/', listNotesHandler);

// Get a single note
notesRouter.get('/:id', getNoteHandler);

// Delete a note
notesRouter.delete('/:id', deleteNoteHandler);
