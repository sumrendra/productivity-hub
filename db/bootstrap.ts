import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db, pool } from './index.js'
import { workspaceMembers, workspaces } from './schema/workspace.js'

const DEFAULT_WORKSPACE_ID = 'ws_default'
const DEFAULT_WORKSPACE_SLUG = 'default'

export async function bootstrapDatabase(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(`
      -- Legacy column extensions (additive only)
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'default';
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS workspace_id TEXT;

      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'p2';
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]';
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project VARCHAR(100);
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id TEXT;

      ALTER TABLE links ADD COLUMN IF NOT EXISTS favicon TEXT;
      ALTER TABLE links ADD COLUMN IF NOT EXISTS og_image TEXT;
      ALTER TABLE links ADD COLUMN IF NOT EXISTS collection VARCHAR(100);
      ALTER TABLE links ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE links ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
      ALTER TABLE links ADD COLUMN IF NOT EXISTS workspace_id TEXT;

      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS workspace_id TEXT;

      ALTER TABLE settings ADD COLUMN IF NOT EXISTS workspace_id TEXT;
      ALTER TABLE ai_conversations ADD COLUMN IF NOT EXISTS workspace_id TEXT;

      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        session_id UUID DEFAULT gen_random_uuid(),
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        context_type VARCHAR(50),
        context_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL,
        value JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "session" (
        id TEXT PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "account" (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at TIMESTAMP,
        refresh_token_expires_at TIMESTAMP,
        scope TEXT,
        password TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "verification" (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workspace_members (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_user_idx
        ON workspace_members (workspace_id, user_id);

      CREATE INDEX IF NOT EXISTS notes_workspace_id_idx ON notes (workspace_id);
      CREATE INDEX IF NOT EXISTS tasks_workspace_id_idx ON tasks (workspace_id);
      CREATE INDEX IF NOT EXISTS links_workspace_id_idx ON links (workspace_id);
      CREATE INDEX IF NOT EXISTS expenses_workspace_id_idx ON expenses (workspace_id);
    `)

    await client.query(`
      ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key;
    `).catch(() => {})

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS settings_workspace_key_unique
        ON settings (workspace_id, key)
        WHERE workspace_id IS NOT NULL;
    `).catch(() => {})

    const existing = await db.select().from(workspaces).where(eq(workspaces.slug, DEFAULT_WORKSPACE_SLUG)).limit(1)

    if (existing.length === 0) {
      await db.insert(workspaces).values({
        id: DEFAULT_WORKSPACE_ID,
        name: 'My Workspace',
        slug: DEFAULT_WORKSPACE_SLUG,
      })
      console.log('Created default workspace for legacy data')
    }

    const tables = ['notes', 'tasks', 'links', 'expenses', 'settings', 'ai_conversations'] as const
    for (const table of tables) {
      await client.query(
        `UPDATE ${table} SET workspace_id = $1 WHERE workspace_id IS NULL`,
        [DEFAULT_WORKSPACE_ID],
      )
    }

    console.log('Database bootstrap completed')
  } finally {
    client.release()
  }
}

export async function ensureWorkspaceForNewUser(userId: string, userName: string): Promise<string> {
  const [defaultWorkspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, DEFAULT_WORKSPACE_SLUG))
    .limit(1)

  if (defaultWorkspace) {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, defaultWorkspace.id))

    if (owners.length === 0) {
      await db.insert(workspaceMembers).values({
        id: randomUUID(),
        workspaceId: defaultWorkspace.id,
        userId,
        role: 'owner',
      })
      return defaultWorkspace.id
    }
  }

  const workspaceId = randomUUID()
  const slug = `workspace-${workspaceId.slice(0, 8)}`

  await db.insert(workspaces).values({
    id: workspaceId,
    name: `${userName.split(' ')[0] || 'My'}'s Workspace`,
    slug,
  })

  await db.insert(workspaceMembers).values({
    id: randomUUID(),
    workspaceId,
    userId,
    role: 'owner',
  })

  return workspaceId
}

export { DEFAULT_WORKSPACE_ID }
