import * as fs from 'fs';
import * as path from 'path';

export type RDPStatus = 'UP' | 'DOWN' | 'UNKNOWN';

export interface State {
  status: RDPStatus;
  lastCheck: string;
  lastChange: string | null;
  consecutiveFailures: number;
}

const STATE_FILE = path.join(process.cwd(), 'state.json');

/**
 * Load previous state from file
 */
export function loadState(): State | null {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return null;
    }

    const data = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(data) as State;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

/**
 * Save current state to file
 */
export function saveState(state: State): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * Check if status has changed
 */
export function hasChanged(current: RDPStatus, previous: RDPStatus | null): boolean {
  if (previous === null || previous === 'UNKNOWN') {
    return false; // First check, no change
  }
  return current !== previous;
}

/**
 * Get current timestamp in ISO format
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Initialize or update state
 */
export function updateState(
  newStatus: RDPStatus,
  previousState: State | null
): { state: State; changed: boolean } {
  const now = getTimestamp();
  const previousStatus = previousState?.status || 'UNKNOWN';
  const changed = hasChanged(newStatus, previousStatus);

  const newState: State = {
    status: newStatus,
    lastCheck: now,
    lastChange: changed ? now : previousState?.lastChange || null,
    consecutiveFailures: newStatus === 'DOWN' 
      ? (previousState?.consecutiveFailures || 0) + 1 
      : 0
  };

  // Save state
  saveState(newState);

  return { state: newState, changed };
}
