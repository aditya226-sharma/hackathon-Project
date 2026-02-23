const LOCAL_STORAGE_KEY = 'runanywhere_chat_history';

export interface LocalMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  stats?: { tokens: number; tokPerSec: number; latencyMs: number };
}

export function saveLocalMessage(message: LocalMessage): void {
  const history = getLocalHistory();
  history.push(message);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
}

export function getLocalHistory(): LocalMessage[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearLocalHistory(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function exportLocalData(): string {
  const history = getLocalHistory();
  return JSON.stringify(history, null, 2);
}

export function exportLocalDataAsCSV(): string {
  const history = getLocalHistory();
  const headers = 'role,message,tokens,tok_per_sec,latency_ms,timestamp\n';
  const rows = history.map(msg => {
    const tokens = msg.stats?.tokens || '';
    const tokPerSec = msg.stats?.tokPerSec || '';
    const latencyMs = msg.stats?.latencyMs || '';
    const text = `"${msg.text.replace(/"/g, '""')}"`;
    return `${msg.role},${text},${tokens},${tokPerSec},${latencyMs},${msg.timestamp}`;
  }).join('\n');
  return headers + rows;
}

export function getStorageSize(): number {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? new Blob([data]).size : 0;
}
