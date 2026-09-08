import { db } from "./db";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "MFA_VERIFIED"
  | "ROLE_CHANGED"
  | "PERMISSION_CHANGED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_ACTIVATED"
  | "ACCOUNT_LOCKED"
  | "SESSION_REVOKED"
  | "SESSION_REVOKED_ALL"
  | "ADMIN_ACTION"
  | "TOOL_EXECUTION"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  | "SYSTEM_INITIALIZATION"
  | "SECURITY_POLICY_UPDATE";

export interface CreateAuditLogParams {
  actorUserId?: string | null;
  actorRole: string;
  targetUserId?: string | null;
  action: AuditAction | string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string;
  status?: "SUCCESS" | "DENIED" | "FAILED";
}

export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    return await db.auditLog.create({
      data: {
        actorUserId: params.actorUserId || null,
        actorRole: params.actorRole,
        targetUserId: params.targetUserId || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || "127.0.0.1",
        status: params.status || "SUCCESS",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}

export type ActivityEventType =
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "RESEARCH_STARTED"
  | "TOOL_INVOKED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  | "VERIFICATION_PASSED"
  | "VERIFICATION_FAILED"
  | "MEMORY_RECORDED"
  | "FILE_UPLOADED"
  | "INTEGRATION_CONNECTED";

export interface CreateActivityEventParams {
  userId: string;
  type: ActivityEventType | string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export async function recordActivityEvent(params: CreateActivityEventParams) {
  try {
    return await db.activityEvent.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write activity event:", error);
    return null;
  }
}
