// AccessControl - Session-based access control with 15-minute timeout
import { AuditLogger } from '../audit/audit-logger';

interface Session {
  id: string;
  startTime: number;
  lastActivity: number;
  permissions: string[];
}

export class AccessControl {
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private static readonly STORAGE_KEY = 'active_sessions';
  private static sessions = new Map<string, Session>();

  /**
   * Starts a new session
   * @returns Session ID
   */
  static startSession(): string {
    const sessionId = crypto.randomUUID();
    const session: Session = {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      permissions: ['READ_PHI', 'WRITE_PHI']
    };

    this.sessions.set(sessionId, session);
    this.persistSession(session);

    AuditLogger.logSystem('SESSION_STARTED', true);
    return sessionId;
  }

  /**
   * Checks if a session is valid
   * @param sessionId - The session ID to check
   * @returns True if session is valid
   */
  static checkSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
      this.endSession(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    this.sessions.set(sessionId, session);
    this.persistSession(session);

    return true;
  }

  /**
   * Ends a session
   * @param sessionId - The session ID to end
   */
  static endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.removePersistedSession(sessionId);
    AuditLogger.logSystem('SESSION_ENDED', true);
  }

  /**
   * Checks if user has permission
   * @param sessionId - The session ID
   * @param permission - The permission to check
   * @returns True if user has permission
   */
  static hasPermission(sessionId: string, permission: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    if (!this.checkSession(sessionId)) {
      return false;
    }

    return session.permissions.includes(permission);
  }

  /**
   * Gets session information
   * @param sessionId - The session ID
   * @returns Session information or null
   */
  static getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session || !this.checkSession(sessionId)) {
      return null;
    }

    return { ...session };
  }

  /**
   * Gets all active sessions
   * @returns Array of active sessions
   */
  static getActiveSessions(): Session[] {
    const activeSessions: Session[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.checkSession(sessionId)) {
        activeSessions.push({ ...session });
      }
    }

    return activeSessions;
  }

  /**
   * Cleans up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now - session.lastActivity;
      if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.endSession(sessionId);
    });

    if (expiredSessions.length > 0) {
      AuditLogger.logSystem('SESSIONS_CLEANED', true);
    }
  }

  /**
   * Persists session to Chrome storage
   * @param session - The session to persist
   */
  private static async persistSession(session: Session): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const sessions: Record<string, Session> = result[this.STORAGE_KEY] || {};
      
      sessions[session.id] = session;
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: sessions });
    } catch (error) {
      AuditLogger.logError('SESSION_PERSIST', 'STORAGE_ERROR');
    }
  }

  /**
   * Removes session from Chrome storage
   * @param sessionId - The session ID to remove
   */
  private static async removePersistedSession(sessionId: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const sessions: Record<string, Session> = result[this.STORAGE_KEY] || {};
      
      delete sessions[sessionId];
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: sessions });
    } catch (error) {
      AuditLogger.logError('SESSION_REMOVE', 'STORAGE_ERROR');
    }
  }

  /**
   * Loads sessions from Chrome storage on startup
   */
  static async loadPersistedSessions(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const sessions: Record<string, Session> = result[this.STORAGE_KEY] || {};
      
      for (const [sessionId, session] of Object.entries(sessions)) {
        // Only load sessions that haven't expired
        const timeSinceLastActivity = Date.now() - session.lastActivity;
        if (timeSinceLastActivity <= this.SESSION_TIMEOUT) {
          this.sessions.set(sessionId, session);
        }
      }
    } catch (error) {
      AuditLogger.logError('SESSION_LOAD', 'STORAGE_ERROR');
    }
  }

  /**
   * Gets session statistics
   * @returns Session statistics
   */
  static getSessionStats(): {
    activeSessions: number;
    totalSessions: number;
    averageSessionDuration: number;
  } {
    const activeSessions = this.getActiveSessions();
    const now = Date.now();
    
    const totalDuration = activeSessions.reduce((total, session) => {
      return total + (now - session.startTime);
    }, 0);

    return {
      activeSessions: activeSessions.length,
      totalSessions: this.sessions.size,
      averageSessionDuration: activeSessions.length > 0 ? totalDuration / activeSessions.length : 0
    };
  }
} 