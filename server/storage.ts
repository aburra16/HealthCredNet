import { 
  users, type User, type InsertUser,
  credentials, type Credential, type InsertCredential,
  credentialRequests, type CredentialRequest, type InsertCredentialRequest,
  auditLogs, type AuditLog, type InsertAuditLog
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNostrPubkey(nostrPubkey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getProviders(specialty?: string): Promise<User[]>;
  
  // Credential management
  getCredential(id: number): Promise<Credential | undefined>;
  getCredentialsByProvider(providerId: number): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: number, credential: Partial<InsertCredential>): Promise<Credential | undefined>;
  
  // Credential request management
  getCredentialRequest(id: number): Promise<CredentialRequest | undefined>;
  getCredentialRequestsByProvider(providerId: number): Promise<CredentialRequest[]>;
  getPendingCredentialRequests(): Promise<CredentialRequest[]>;
  createCredentialRequest(request: InsertCredentialRequest): Promise<CredentialRequest>;
  updateCredentialRequest(id: number, request: Partial<InsertCredentialRequest>): Promise<CredentialRequest | undefined>;
  
  // Audit logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private credentials: Map<number, Credential>;
  private credentialRequests: Map<number, CredentialRequest>;
  private auditLogs: Map<number, AuditLog>;
  
  private userIdCounter: number;
  private credentialIdCounter: number;
  private requestIdCounter: number;
  private logIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.credentials = new Map();
    this.credentialRequests = new Map();
    this.auditLogs = new Map();
    
    this.userIdCounter = 1;
    this.credentialIdCounter = 1;
    this.requestIdCounter = 1;
    this.logIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByNostrPubkey(nostrPubkey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.nostrPubkey === nostrPubkey
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getProviders(specialty?: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => {
      if (user.role !== 'provider') return false;
      if (specialty && user.specialty !== specialty) return false;
      return true;
    });
  }
  
  // Credential methods
  async getCredential(id: number): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }
  
  async getCredentialsByProvider(providerId: number): Promise<Credential[]> {
    return Array.from(this.credentials.values()).filter(
      cred => cred.providerId === providerId
    );
  }
  
  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const id = this.credentialIdCounter++;
    const credential: Credential = { ...insertCredential, id };
    this.credentials.set(id, credential);
    return credential;
  }
  
  async updateCredential(id: number, updates: Partial<InsertCredential>): Promise<Credential | undefined> {
    const credential = this.credentials.get(id);
    if (!credential) return undefined;
    
    const updatedCredential = { ...credential, ...updates };
    this.credentials.set(id, updatedCredential);
    return updatedCredential;
  }
  
  // Credential request methods
  async getCredentialRequest(id: number): Promise<CredentialRequest | undefined> {
    return this.credentialRequests.get(id);
  }
  
  async getCredentialRequestsByProvider(providerId: number): Promise<CredentialRequest[]> {
    return Array.from(this.credentialRequests.values()).filter(
      req => req.providerId === providerId
    );
  }
  
  async getPendingCredentialRequests(): Promise<CredentialRequest[]> {
    return Array.from(this.credentialRequests.values()).filter(
      req => req.status === 'pending'
    );
  }
  
  async createCredentialRequest(insertRequest: InsertCredentialRequest): Promise<CredentialRequest> {
    const id = this.requestIdCounter++;
    const request: CredentialRequest = { ...insertRequest, id };
    this.credentialRequests.set(id, request);
    return request;
  }
  
  async updateCredentialRequest(id: number, updates: Partial<InsertCredentialRequest>): Promise<CredentialRequest | undefined> {
    const request = this.credentialRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.credentialRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Audit log methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.logIdCounter++;
    const log: AuditLog = { ...insertLog, id };
    this.auditLogs.set(id, log);
    return log;
  }
  
  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values());
  }
  
  // Sample data initialization
  private initializeSampleData() {
    // Create sample users
    const authority = this.createUser({
      username: 'authority',
      displayName: 'Credential Authority',
      role: 'authority',
      nostrPubkey: 'npub1authxyz',
      location: 'Washington, DC',
      specialty: undefined,
      institution: 'National Medical Certification Board',
      about: 'Official credential issuing authority for medical professionals',
      avatar: undefined
    });
    
    const provider1 = this.createUser({
      username: 'dr_johnson',
      displayName: 'Dr. Sarah Johnson',
      role: 'provider',
      nostrPubkey: 'npub1sarah123',
      location: 'New York, NY',
      specialty: 'Cardiology',
      institution: 'New York Medical Center',
      about: 'Cardiologist with 15 years of experience specializing in preventive cardiology and heart disease management.',
      avatar: undefined
    });
    
    const provider2 = this.createUser({
      username: 'dr_chen',
      displayName: 'Dr. Michael Chen',
      role: 'provider',
      nostrPubkey: 'npub1michael456',
      location: 'Boston, MA',
      specialty: 'Neurology',
      institution: 'Boston Neurological Center',
      about: 'Board-certified neurologist with 12 years of experience specializing in neurodegenerative disorders and stroke management.',
      avatar: undefined
    });
    
    const provider3 = this.createUser({
      username: 'dr_rodriguez',
      displayName: 'Dr. Emily Rodriguez',
      role: 'provider',
      nostrPubkey: 'npub1emily789',
      location: 'Chicago, IL',
      specialty: 'Pediatrics',
      institution: 'Children\'s Hospital',
      about: 'Pediatrician focusing on early childhood development and preventive care.',
      avatar: undefined
    });
    
    const user1 = this.createUser({
      username: 'patient1',
      displayName: 'John Doe',
      role: 'user',
      nostrPubkey: 'npub1john123',
      location: 'New York, NY',
      specialty: undefined,
      institution: undefined,
      about: undefined,
      avatar: undefined
    });
    
    // Create sample credentials
    this.createCredential({
      providerId: 3,  // Dr. Rodriguez
      type: 'Medical License',
      issuerId: 1,    // Authority
      status: 'approved',
      badgeId: 'badge123456',
      issuingAuthority: 'Illinois State Medical Board',
      details: 'Licensed medical practitioner in the state of Illinois',
      issuedAt: new Date('2023-04-30'),
      expiresAt: new Date('2025-04-30')
    });
    
    // Create sample credential requests
    this.createCredentialRequest({
      providerId: 2,  // Dr. Chen
      type: 'Board Certification',
      issuingAuthority: 'American Board of Psychiatry and Neurology',
      details: 'Completed residency and board examination in 2018',
      status: 'pending',
      createdAt: new Date('2023-05-03'),
      reviewedAt: undefined,
      reviewedById: undefined
    });
    
    this.createCredentialRequest({
      providerId: 1,  // Dr. Johnson
      type: 'Fellowship',
      issuingAuthority: 'American College of Cardiology',
      details: 'Completed advanced training in interventional cardiology',
      status: 'pending',
      createdAt: new Date('2023-05-01'),
      reviewedAt: undefined,
      reviewedById: undefined
    });
  }
}

export const storage = new MemStorage();
