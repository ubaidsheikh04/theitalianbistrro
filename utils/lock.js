import { promises as fs } from 'fs';
import path from 'path';

const LOCK_DIR = '.locks';

// This function retries an operation with a delay.
async function retry(operation, delay = 100, retries = 10) {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error.code === 'EEXIST') {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(operation, delay, retries - 1);
    }
    throw error;
  }
}

// Acquire a lock for a given file path
async function acquireLock(lockFilePath) {
  try {
    // Ensure the lock directory exists
    await fs.mkdir(path.dirname(lockFilePath), { recursive: true });
    // Attempt to create the lock file exclusively
    await fs.writeFile(lockFilePath, '', { flag: 'wx' });
  } catch (error) {
    // For EEXIST, the retry function will handle it. For other errors, re-throw.
    if (error.code !== 'EEXIST') {
      throw error;
    }
    throw error; // Re-throw EEXIST for retry logic
  }
}

// Release the lock
async function releaseLock(lockFilePath) {
  try {
    await fs.unlink(lockFilePath);
  } catch (error) {
    // Ignore if the file doesn't exist (e.g., already released)
    if (error.code !== 'ENOENT') {
      console.error(`Failed to release lock: ${lockFilePath}`, error);
    }
  }
}

// Higher-order function to wrap an operation with a lock
export async function withLock(filePath, operation) {
  const lockFilePath = path.join(process.cwd(), LOCK_DIR, `${path.basename(filePath)}.lock`);

  // Retry acquiring the lock
  await retry(async () => acquireLock(lockFilePath));

  try {
    // Execute the main operation once the lock is acquired
    return await operation();
  } finally {
    // Always release the lock
    await releaseLock(lockFilePath);
  }
}
