/**
 * logger.util.js — Lightweight Console Logger
 *
 * A simple wrapper around console.* that adds:
 *  - Timestamps
 *  - Log-level labels
 *  - Color coding
 *
 * In production you can swap this for Winston or Pino without touching
 * any other file — just update this one.
 */

const COLOURS = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  info:   '\x1b[36m',  // Cyan
  warn:   '\x1b[33m',  // Yellow
  error:  '\x1b[31m',  // Red
  debug:  '\x1b[35m',  // Magenta
};

function timestamp() {
  return new Date().toISOString();
}

function format(level, colour, message) {
  const ts = `${COLOURS.dim}${timestamp()}${COLOURS.reset}`;
  const lbl = `${colour}[${level.toUpperCase()}]${COLOURS.reset}`;
  return `${ts} ${lbl} ${message}`;
}

export const logger = {
  info:  (msg) => console.log(format('info',  COLOURS.info,  msg)),
  warn:  (msg) => console.warn(format('warn', COLOURS.warn,  msg)),
  error: (msg) => console.error(format('error', COLOURS.error, msg)),
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(format('debug', COLOURS.debug, msg));
    }
  },
};
