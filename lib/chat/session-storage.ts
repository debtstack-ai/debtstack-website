import { Message } from '@/app/dashboard/chat/components/ChatMessages';

export interface SessionSummary {
  id: string;
  title: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
  workspace_id: string | null;
}

export interface ServerSession {
  id: string;
  title: string;
  messages: Message[];
  total_cost: number;
  created_at: string;
  updated_at: string;
  workspace_id: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
  session_count: number;
}

export async function fetchSessionList(): Promise<SessionSummary[]> {
  const res = await fetch('/api/chat-sessions');
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const data = await res.json();
  return data.sessions;
}

export async function fetchSession(id: string): Promise<ServerSession> {
  const res = await fetch(`/api/chat-sessions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  const data = await res.json();
  return data.session;
}

export async function saveSession(session: {
  id: string;
  title: string;
  messages: Message[];
  totalCost: number;
  createdAt: string;
  workspaceId?: string | null;
}): Promise<void> {
  const res = await fetch('/api/chat-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: session.id,
      title: session.title,
      messages: session.messages,
      total_cost: session.totalCost,
      created_at: session.createdAt,
      workspace_id: session.workspaceId ?? null,
    }),
  });
  if (!res.ok) throw new Error('Failed to save session');
}

// Workspace CRUD
export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await fetch('/api/workspaces');
  if (!res.ok) throw new Error('Failed to fetch workspaces');
  const data = await res.json();
  return data.workspaces;
}

export async function createWorkspace(name: string, color?: string): Promise<Workspace> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error('Failed to create workspace');
  const data = await res.json();
  return data.workspace;
}

export async function updateWorkspace(id: string, updates: { name?: string; color?: string }): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update workspace');
}

export async function deleteWorkspace(id: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete workspace');
}

export async function deleteSessionRemote(id: string): Promise<void> {
  const res = await fetch(`/api/chat-sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}

const MIGRATION_FLAG = 'debtstack_chat_migrated_v1';
const STORAGE_KEY_HISTORY = 'debtstack_chat_history';

interface LocalSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  totalCost: number;
}

export async function migrateFromLocalStorage(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  if (localStorage.getItem(MIGRATION_FLAG)) return 0;

  let localSessions: LocalSession[];
  try {
    localSessions = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
  } catch {
    localSessions = [];
  }

  if (localSessions.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, '1');
    return 0;
  }

  let migrated = 0;
  for (const session of localSessions) {
    try {
      await saveSession(session);
      migrated++;
    } catch {
      // Skip failed sessions — they stay in localStorage
    }
  }

  localStorage.setItem(MIGRATION_FLAG, '1');
  return migrated;
}
