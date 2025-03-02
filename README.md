# MedCred: Nostr Healthcare Credential Platform

A decentralized healthcare credential management platform leveraging the Nostr protocol for secure, privacy-preserving authentication and provider verification. The system provides advanced security controls and streamlined professional identity management.

## Architecture Overview

The project follows a modern full-stack JavaScript architecture with React/TypeScript on the frontend and Express on the backend. It uses an in-memory database for development but is designed to be easily extended to use PostgreSQL with Drizzle ORM.

## Core Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, ShadcnUI
- **Backend**: Express.js, Node.js
- **Authentication**: Nostr protocol (NIP-07 extension support + direct key authentication)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with ShadcnUI components

## Project Structure

```
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # ShadcnUI components
│   │   │   ├── authority/  # Authority dashboard components
│   │   │   ├── provider/   # Provider profile components
│   │   │   ├── user/       # User-facing components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── modals/     # Modal components
│   │   │   └── credentials/# Credential display components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and services
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── authority/  # Authority dashboard pages
│   │   │   ├── provider/   # Provider pages
│   │   │   └── user/       # User pages
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main application component
│   │   ├── index.css       # Global CSS
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend code
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage implementation
│   └── vite.ts             # Vite development server setup
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema and types
└── config files            # Various configuration files
```

## Core Components and Functionality

### Backend Components

#### `server/index.ts`
- Server entry point 
- Sets up Express middleware and error handling
- Initializes the API routes

#### `server/routes.ts`
- Defines all API endpoints for the application
- Handles authentication with Nostr key validation
- Implements CRUD operations for users, credentials, and credential requests
- Special security logic for authority roles with token validation

#### `server/storage.ts`
- Implements the `IStorage` interface for data persistence
- Includes `MemStorage` class for in-memory data storage
- Contains methods for user, credential, and credential request management
- Handles audit logging

#### `shared/schema.ts`
- Defines database schema using Drizzle ORM
- Creates TypeScript types and Zod validation schemas
- Defines credential types and specialties

### Frontend Components

#### Authentication System (`client/src/lib/auth.ts`, `client/src/pages/auth/Login.tsx`)
- Implements Nostr protocol for authentication
- Supports both NIP-07 browser extension and direct nsec key authentication
- Special handling for NosFabricaTest authority role with hardcoded token
- Token-based authentication flow

#### Nostr Integration (`client/src/lib/nostr.ts`, `client/src/lib/ndkClient.ts`)
- Key pair generation and validation
- NIP-58 badge creation for credentials
- Relay connections and management
- Badge verification

#### API Client (`client/src/lib/queryClient.ts`)
- TanStack Query setup for data fetching
- HTTP request abstractions
- Error handling

#### Page Components
- **Auth Pages**: Login, registration, and authentication flows
- **Authority Pages**: Credential issuance, request management, audit logs
- **Provider Pages**: Profile management, credential showcase
- **User Pages**: Provider search, credential verification

#### UI Components
- ShadcnUI components extended for application requirements
- Role-specific components (Authority, Provider, User)
- Credential display and verification components
- Layout and navigation components

## Authentication Flow

1. **Role Selection**: User selects one of three roles (patient, provider, authority)
2. **Authentication Method**:
   - NIP-07 browser extension (patient, provider)
   - Direct nsec key input (all roles)
3. **Authority Restriction**:
   - Only the NosFabricaTest account can authenticate as an authority
   - Requires valid nsec key: `nsec18r04f8s6u6z6uestrtyn2xh6jjlrgpgapa6mg75fth97sh2hn2dqccjlum`
   - Requires hardcoded token: `nosfabrica-test-9876543210`
4. **Session Management**: Authentication state stored in localStorage

## Credential System

### Credential Types
Defined in `shared/schema.ts` as `CREDENTIAL_TYPES`:
- Medical License
- Board Certification
- Hospital Affiliation
- Professional Association
- Academic Credential
- Specialty Certification

### Credential Workflow
1. **Request**: Provider requests credential from authority
2. **Review**: Authority reviews request
3. **Issuance**: Authority issues credential as a NIP-58 badge
4. **Verification**: Patients verify provider credentials

### NIP-58 Badge Implementation
- Badge creation function in `client/src/lib/nostr.ts`
- Uses nostr-tools and NDK for badge creation
- Follows the badges.page standard

## Data Models

### User
- Core user profile with role-based properties
- Extended with provider-specific fields (specialty, institution, etc.)

### Credential
- Links provider to a specific credential type
- Tracks issuance, status, and verification

### Credential Request
- Tracks the credential request workflow
- Status: pending, approved, rejected

### Audit Log
- Records all administrative actions
- Essential for credential governance

## Security Features

1. **Role-Based Access Control**: Strict separation between authority, provider, and user roles
2. **Authority Restriction**: Only NosFabricaTest account can access authority features
3. **Token-Based Authentication**: Additional security layer for authority role
4. **nsec Key Validation**: Direct key validation for sensitive operations
5. **Audit Logging**: All credential operations are logged

## Current Development Status

The core functionality is implemented, including:
1. ✅ Nostr authentication with role-based access control
2. ✅ Authority dashboard for credential management
3. ✅ Provider profiles with credential showcase
4. ✅ User interface for finding and verifying providers
5. ✅ NIP-58 badge creation and verification

## Enhancement Opportunities

1. **Database Implementation**: Replace in-memory storage with PostgreSQL
2. **Advanced Search**: Implement provider search by specialty, location
3. **Credential Revocation**: Add explicit revocation workflow
4. **Event Relay**: Improve Nostr relay communication
5. **Mobile Optimization**: Enhance responsive design

## Running the Project

1. **Development**:
   ```bash
   npm run dev
   ```
   This starts the Express server and Vite development server on port 5000.

2. **Authority Login**:
   - Use the NosFabricaTest credentials:
     - nsec: `nsec18r04f8s6u6z6uestrtyn2xh6jjlrgpgapa6mg75fth97sh2hn2dqccjlum`
     - npub: `npub1uvc02wxk75r06n5wu8jwg8w3slycyw9hqpxlgngprdty393tv87s3wfcxu`
   - Token is auto-filled: `nosfabrica-test-9876543210`

3. **Provider/Patient Login**:
   - Use either NIP-07 extension
   - Or generate/provide valid Nostr keys

## API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate user with Nostr key and role

### Users
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `POST /api/users`: Create new user
- `PATCH /api/users/:id`: Update user

### Providers
- `GET /api/providers`: Get all providers (optional specialty filter)

### Credentials
- `GET /api/credentials`: Get credentials (provider filter supported)
- `POST /api/credentials`: Create new credential

### Credential Requests
- `GET /api/credential-requests`: Get credential requests with filters
- `POST /api/credential-requests`: Create new credential request
- `PATCH /api/credential-requests/:id`: Update credential request status

### Audit Logs
- `GET /api/audit-logs`: Get all audit logs

### Metadata
- `GET /api/specialties`: Get available specialties
- `GET /api/credential-types`: Get available credential types

## Code Conventions

- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with ShadcnUI components
- **Data Fetching**: TanStack Query with SWR-like patterns
- **Forms**: React Hook Form with Zod validation
- **Error Handling**: Toast notifications for user feedback
- **Type Safety**: Strict TypeScript typing throughout

## Deployment Considerations

1. **Environment Variables**:
   - Replace hardcoded token with environment variable
   - Configure Nostr relay URLs

2. **Database**:
   - Implement PostgreSQL connection for production
   - Set up database migrations

3. **Authentication**:
   - Consider adding more robust session management
   - Implement key refresh and rotation

4. **Security**:
   - Add rate limiting for authentication attempts
   - Implement CSRF protection

## Development Workflow

1. **Adding New Features**:
   - Update schema in `shared/schema.ts` if needed
   - Implement backend routes in `server/routes.ts`
   - Create UI components in `client/src/components/`
   - Add page components in `client/src/pages/`
   - Update navigation in `App.tsx`

2. **Testing**:
   - Test authority features with NosFabricaTest credentials
   - Test provider/user features with generated keys or extension

This README provides a comprehensive guide to the current state of the project, enabling any developer to understand the architecture, authentication flow, and key components. The code is organized following modern React/TypeScript patterns with a focus on type safety, component reusability, and clean separation of concerns.