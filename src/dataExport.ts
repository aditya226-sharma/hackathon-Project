export interface VisionRecord {
  timestamp: number;
  prompt: string;
  result: string;
  processingTime: number;
  mode: 'single' | 'live';
}

export interface VoiceRecord {
  timestamp: number;
  transcript: string;
  response: string;
}

export function saveVisionData(record: VisionRecord) {
  const existing = JSON.parse(localStorage.getItem('visionData') || '[]');
  existing.push(record);
  localStorage.setItem('visionData', JSON.stringify(existing));
}

export function saveVoiceData(record: VoiceRecord) {
  const existing = JSON.parse(localStorage.getItem('voiceData') || '[]');
  existing.push(record);
  localStorage.setItem('voiceData', JSON.stringify(existing));
}

export function exportVisionJSON() {
  const data = localStorage.getItem('visionData') || '[]';
  downloadFile(data, 'vision-data.json', 'application/json');
}

export function exportVoiceJSON() {
  const data = localStorage.getItem('voiceData') || '[]';
  downloadFile(data, 'voice-data.json', 'application/json');
}

export function exportVisionCSV() {
  const data: VisionRecord[] = JSON.parse(localStorage.getItem('visionData') || '[]');
  const csv = [
    'Timestamp,Date,Prompt,Result,Processing Time (ms),Mode',
    ...data.map(r => `${r.timestamp},"${new Date(r.timestamp).toISOString()}","${escapeCSV(r.prompt)}","${escapeCSV(r.result)}",${r.processingTime},${r.mode}`)
  ].join('\n');
  downloadFile(csv, 'vision-data.csv', 'text/csv');
}

export function exportVoiceCSV() {
  const data: VoiceRecord[] = JSON.parse(localStorage.getItem('voiceData') || '[]');
  const csv = [
    'Timestamp,Date,Transcript,Response',
    ...data.map(r => `${r.timestamp},"${new Date(r.timestamp).toISOString()}","${escapeCSV(r.transcript)}","${escapeCSV(r.response)}"`)
  ].join('\n');
  downloadFile(csv, 'voice-data.csv', 'text/csv');
}

function escapeCSV(str: string): string {
  return str.replace(/"/g, '""');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
