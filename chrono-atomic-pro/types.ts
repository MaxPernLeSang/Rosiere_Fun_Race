export interface RaceRecord {
  id: string;
  timestamp: number; // The absolute system time when recorded
  elapsed: number; // The duration since start
  bibNumber: string; // The runner's number (dossard)
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
}
