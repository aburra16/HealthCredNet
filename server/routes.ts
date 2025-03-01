import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCredentialSchema, 
  insertCredentialRequestSchema,
  updateCredentialRequestSchema,
  insertAuditLogSchema,
  SPECIALTIES,
  CREDENTIAL_TYPES,
  type CredentialRequest
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // User routes
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  router.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  router.post('/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with the same public key already exists
      const existingUser = await storage.getUserByNostrPubkey(userData.nostrPubkey);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this nostr public key already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  router.patch('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });
  
  // Provider routes
  router.get('/providers', async (req: Request, res: Response) => {
    try {
      const specialty = req.query.specialty as string | undefined;
      const providers = await storage.getProviders(specialty);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  });
  
  // Authentication route with strict authority restriction
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { publicKey, role } = req.body;
      
      // Extract the Nostr public key from the request (sometimes it's sent as nostrPubkey)
      const nostrPubkey = req.body.nostrPubkey || publicKey;
      
      if (!nostrPubkey) {
        return res.status(400).json({ error: 'Nostr public key is required' });
      }
      
      // STRICT SERVER-SIDE AUTHORITY LOGIN RESTRICTION
      if (role === 'authority') {
        // NosFabricaTest public key
        const nosFabricaTestPubkey = 'npub1uvc02wxk75r06n5wu8jwg8w3slycyw9hqpxlgngprdty393tv87s3wfcxu';
        
        // Log the attempt
        console.log(`Authority login attempt: ${nostrPubkey}`);
        console.log(`Required pubkey: ${nosFabricaTestPubkey}`);
        
        // Compare with NosFabricaTest pubkey
        if (nostrPubkey !== nosFabricaTestPubkey) {
          console.error('Authority login denied - unauthorized pubkey');
          return res.status(403).json({ error: 'Only NosFabricaTest account can log in as an authority' });
        }
        
        console.log('Authority login allowed - valid NosFabricaTest credentials');
      }
      
      // Check if user exists
      let user = await storage.getUserByNostrPubkey(nostrPubkey);
      
      // Auto-create user if not exists (for demo purposes)
      if (!user) {
        user = await storage.createUser({
          username: `user_${Math.floor(Math.random() * 10000)}`,
          displayName: `New ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role,
          nostrPubkey,
          location: '',
          specialty: '',
          institution: '',
          about: '',
          avatar: '',
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
  
  // Credential routes
  router.get('/credentials', async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId ? parseInt(req.query.providerId as string) : undefined;
      
      if (providerId) {
        const credentials = await storage.getCredentialsByProvider(providerId);
        return res.json(credentials);
      }
      
      // Return empty array if no provider ID is specified
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch credentials' });
    }
  });
  
  router.post('/credentials', async (req: Request, res: Response) => {
    try {
      const credentialData = insertCredentialSchema.parse(req.body);
      
      const credential = await storage.createCredential(credentialData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: credentialData.issuerId,
        action: 'create_credential',
        targetId: credential.id,
        details: `Created ${credentialData.type} credential for provider ${credentialData.providerId}`,
        timestamp: new Date()
      });
      
      res.status(201).json(credential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create credential' });
    }
  });
  
  // Credential request routes
  router.get('/credential-requests', async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId ? parseInt(req.query.providerId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      // Get base requests
      let requests: CredentialRequest[];
      if (providerId) {
        requests = await storage.getCredentialRequestsByProvider(providerId);
      } else if (status) {
        // Filter by status
        requests = Array.from((await storage.getPendingCredentialRequests()))
          .filter(req => status === 'all' || req.status === status);
      } else {
        // Return pending requests if no provider ID or status is specified
        requests = await storage.getPendingCredentialRequests();
      }
      
      // Enrich requests with provider information
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          // Get provider information
          const provider = await storage.getUser(request.providerId);
          
          if (!provider) {
            return {
              ...request,
              provider: {
                id: request.providerId,
                firstName: "Unknown",
                lastName: "Provider",
                specialty: "",
                nostrPubkey: ""
              }
            };
          }
          
          // Split the display name into first and last name
          const nameParts = provider.displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return {
            ...request,
            provider: {
              id: provider.id,
              firstName,
              lastName,
              specialty: provider.specialty || '',
              nostrPubkey: provider.nostrPubkey,
              profileImageUrl: provider.avatar
            }
          };
        })
      );
      
      res.json(enrichedRequests);
    } catch (error) {
      console.error('Error fetching credential requests:', error);
      res.status(500).json({ error: 'Failed to fetch credential requests' });
    }
  });
  
  router.post('/credential-requests', async (req: Request, res: Response) => {
    try {
      const requestData = insertCredentialRequestSchema.parse({
        ...req.body,
        status: 'pending',
        createdAt: new Date()
      });
      
      const request = await storage.createCredentialRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create credential request' });
    }
  });
  
  router.patch('/credential-requests/:id', async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      
      // Parse and validate the update data
      const updateData = updateCredentialRequestSchema.parse({
        status: req.body.status,
        reviewedAt: new Date(),
        reviewedById: req.body.reviewedById
      });
      
      // Update the request
      const updatedRequest = await storage.updateCredentialRequest(requestId, updateData);
      
      if (!updatedRequest) {
        return res.status(404).json({ error: 'Credential request not found' });
      }
      
      // If approved, create the credential
      if (updateData.status === 'approved' && req.body.badgeId) {
        const credential = await storage.createCredential({
          providerId: updatedRequest.providerId,
          type: updatedRequest.type,
          issuerId: updateData.reviewedById || 0,
          status: 'approved',
          badgeId: req.body.badgeId,
          issuingAuthority: updatedRequest.issuingAuthority,
          details: updatedRequest.details,
          issuedAt: new Date(),
          expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined
        });
        
        // Create audit log
        await storage.createAuditLog({
          userId: updateData.reviewedById || 0,
          action: 'issue_credential',
          targetId: credential.id,
          details: `Issued ${updatedRequest.type} credential for provider ${updatedRequest.providerId}`,
          timestamp: new Date()
        });
        
        return res.json({ request: updatedRequest, credential });
      }
      
      // Create audit log for rejection
      if (updateData.status === 'rejected') {
        await storage.createAuditLog({
          userId: updateData.reviewedById || 0,
          action: 'reject_credential_request',
          targetId: requestId,
          details: `Rejected ${updatedRequest.type} credential request for provider ${updatedRequest.providerId}`,
          timestamp: new Date()
        });
      }
      
      res.json({ request: updatedRequest });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update credential request' });
    }
  });
  
  // Audit log routes
  router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });
  
  // Metadata routes
  router.get('/specialties', (_req: Request, res: Response) => {
    res.json(SPECIALTIES);
  });
  
  router.get('/credential-types', (_req: Request, res: Response) => {
    res.json(CREDENTIAL_TYPES);
  });
  
  // Register the router
  app.use('/api', router);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
