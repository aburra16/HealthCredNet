import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for all user types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(), // 'user', 'provider', or 'authority'
  nostrPubkey: text("nostr_pubkey").notNull().unique(), // npub key
  location: text("location"),
  specialty: text("specialty"),
  institution: text("institution"),
  about: text("about"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
  role: true,
  nostrPubkey: true,
  location: true,
  specialty: true,
  institution: true,
  about: true,
  avatar: true,
});

// Credentials model for provider credentials
export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  type: text("type").notNull(), // 'board_certification', 'medical_license', etc.
  issuerId: integer("issuer_id").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected'
  badgeId: text("badge_id"), // NIP-58 badge ID
  issuingAuthority: text("issuing_authority").notNull(),
  details: text("details"),
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
});

export const insertCredentialSchema = createInsertSchema(credentials).pick({
  providerId: true,
  type: true,
  issuerId: true,
  status: true,
  badgeId: true,
  issuingAuthority: true,
  details: true,
  issuedAt: true,
  expiresAt: true,
});

// Credential request model
export const credentialRequests = pgTable("credential_requests", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  type: text("type").notNull(), // 'board_certification', 'medical_license', etc.
  issuingAuthority: text("issuing_authority").notNull(),
  details: text("details"),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: integer("reviewed_by_id"),
});

export const insertCredentialRequestSchema = createInsertSchema(credentialRequests).pick({
  providerId: true,
  type: true,
  issuingAuthority: true,
  details: true,
  status: true,
  createdAt: true,
});

// Schema for updating credential requests, including review fields
export const updateCredentialRequestSchema = createInsertSchema(credentialRequests).pick({
  status: true,
  reviewedAt: true,
  reviewedById: true,
});

// Audit log model
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // 'create_credential', 'revoke_credential', etc.
  targetId: integer("target_id"), // ID of the affected credential
  details: text("details"),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  targetId: true,
  details: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;

export type CredentialRequest = typeof credentialRequests.$inferSelect;
export type InsertCredentialRequest = z.infer<typeof insertCredentialRequestSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Specialty types
export const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
] as const;

export type Specialty = typeof SPECIALTIES[number];

// Credential types
export const CREDENTIAL_TYPES = [
  'Board Certification',
  'Medical License',
  'Fellowship',
  'Specialty Certification',
  'Hospital Affiliation',
] as const;

export type CredentialType = typeof CREDENTIAL_TYPES[number];
