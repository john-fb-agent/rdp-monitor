import * as net from 'net';

export interface PortCheckResult {
  success: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * Check if a TCP port is accessible
 * @param host - Host to check (default: localhost)
 * @param port - Port number (default: 3389)
 * @param timeout - Connection timeout in ms (default: 3000)
 * @returns Promise with check result
 */
export async function checkPort(
  host: string = 'localhost',
  port: number = 3389,
  timeout: number = 3000
): Promise<PortCheckResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const startTime = Date.now();
    let connected = false;
    let resolved = false;

    const cleanup = () => {
      socket.destroy();
    };

    const resolveResult = (success: boolean, error?: string) => {
      if (resolved) return;
      resolved = true;
      
      const responseTime = Date.now() - startTime;
      resolve({
        success,
        responseTime: success ? responseTime : undefined,
        error
      });
      cleanup();
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      connected = true;
      resolveResult(true);
    });

    socket.on('error', (err) => {
      resolveResult(false, err.message);
    });

    socket.on('timeout', () => {
      resolveResult(false, 'Connection timeout');
    });

    socket.on('close', () => {
      if (!resolved) {
        resolveResult(connected, connected ? undefined : 'Connection closed');
      }
    });

    socket.connect(port, host);
  });
}

/**
 * Get RDP status
 * @param host - Host to check
 * @param port - RDP port
 * @param timeout - Connection timeout
 * @returns 'UP' or 'DOWN'
 */
export async function getRDPStatus(
  host: string = 'localhost',
  port: number = 3389,
  timeout: number = 3000
): Promise<'UP' | 'DOWN'> {
  try {
    const result = await checkPort(host, port, timeout);
    return result.success ? 'UP' : 'DOWN';
  } catch (error) {
    return 'DOWN';
  }
}
