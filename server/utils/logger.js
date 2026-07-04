const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  success: '\x1b[32m', // Green
  gray: '\x1b[90m' // Gray
};

function getTimestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (...args) => {
    console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.info}[INFO]${colors.reset}`, ...args);
  },
  warn: (...args) => {
    console.warn(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.warn}[WARN]${colors.reset}`, ...args);
  },
  error: (...args) => {
    console.error(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.error}[ERROR]${colors.reset}`, ...args);
  },
  success: (...args) => {
    console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.success}[SUCCESS]${colors.reset}`, ...args);
  }
};

export default logger;
