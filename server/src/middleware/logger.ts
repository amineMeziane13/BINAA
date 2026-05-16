import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logDir = join(__dirname, '../../logs');

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const stream = createWriteStream(join(logDir, 'app.log'), { flags: 'a' });

type Level = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

function format(level: Level, module: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] [${module}] ${message}${metaStr}\n`;
}

function write(level: Level, module: string, message: string, meta?: unknown): void {
  const line = format(level, module, message, meta);
  stream.write(line);
  if (level === 'ERROR' || level === 'WARN') {
    console.error(line.trim());
  } else {
    console.log(line.trim());
  }
}

export const logger = {
  error: (module: string, message: string, meta?: unknown) => write('ERROR', module, message, meta),
  warn: (module: string, message: string, meta?: unknown) => write('WARN', module, message, meta),
  info: (module: string, message: string, meta?: unknown) => write('INFO', module, message, meta),
  debug: (module: string, message: string, meta?: unknown) => write('DEBUG', module, message, meta),
};
