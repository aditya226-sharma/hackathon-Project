import { createClient } from '@supabase/supabase-js';
import { getPrivacyMode } from './privacy';

const supabaseUrl = 'https://cwpsvralrzwunrpbsvgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cHN2cmFscnp3dW5ycGJzdmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjcyMzQsImV4cCI6MjA4NzI0MzIzNH0.d_5rKle9T7Ssm0lQDv9bfhQYjctYR5I2nfbL24nhzm0';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  message: string;
  tokens?: number;
  tok_per_sec?: number;
  latency_ms?: number;
  timestamp: string;
}

function convertToCSV(messages: Omit<ChatMessage, 'id'>[]): string {
  const headers = 'role,message,tokens,tok_per_sec,latency_ms,timestamp\n';
  const rows = messages.map(msg => {
    const tokens = msg.tokens || '';
    const tokPerSec = msg.tok_per_sec || '';
    const latencyMs = msg.latency_ms || '';
    const text = `"${msg.message.replace(/"/g, '""')}"`;
    return `${msg.role},${text},${tokens},${tokPerSec},${latencyMs},${msg.timestamp}`;
  }).join('\n');
  return headers + rows;
}

export async function saveChatMessages(messages: Omit<ChatMessage, 'id'>[]) {
  if (getPrivacyMode()) return true;
  
  // Save to database table
  const { error: dbError } = await supabase.from('chat_messages').insert(messages);
  if (dbError) console.error('Failed to save to database:', dbError);
  
  // Save to CSV in storage
  try {
    const csv = convertToCSV(messages);
    const filename = `chat-${new Date().toISOString().split('T')[0]}-${Date.now()}.csv`;
    const { error: storageError } = await supabase.storage
      .from('chat-exports')
      .upload(filename, csv, {
        contentType: 'text/csv',
        upsert: false
      });
    if (storageError) console.error('Failed to save CSV:', storageError);
  } catch (err) {
    console.error('CSV storage error:', err);
  }
  
  return !dbError;
}

export async function getChatHistory(limit = 50) {
  if (getPrivacyMode()) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) console.error('Failed to fetch history:', error);
  return data || [];
}