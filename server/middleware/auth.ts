import type { NextFunction, Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'
import { db } from '../../db/index.js'
import { workspaceMembers } from '../../db/schema/workspace.js'

export interface AuthedRequest extends Request {
  userId?: string
  workspaceId?: string
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.userId = session.user.id

    const requestedWorkspace = req.headers['x-workspace-id'] as string | undefined
    const memberships = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, session.user.id))

    if (memberships.length === 0) {
      return res.status(403).json({ error: 'No workspace access' })
    }

    if (requestedWorkspace) {
      const allowed = memberships.some((m) => m.workspaceId === requestedWorkspace)
      if (!allowed) {
        return res.status(403).json({ error: 'Workspace access denied' })
      }
      req.workspaceId = requestedWorkspace
    } else {
      const ownerMembership =
        memberships.find((m) => m.role === 'owner') ?? memberships[0]
      req.workspaceId = ownerMembership.workspaceId
    }

    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auth failed'
    res.status(401).json({ error: message })
  }
}

export async function optionalAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (session?.user) {
      req.userId = session.user.id
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, session.user.id))
        .limit(1)
      req.workspaceId = membership?.workspaceId
    }

    next()
  } catch {
    next()
  }
}

export async function getUserWorkspaces(userId: string) {
  return db
    .select({
      id: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
}
