# Posthumous Notification System

## Overview

This is a full-stack web application for managing digital assets and providing posthumous notifications to designated family members or nominees. The system allows users to securely store asset information and set up well-being alerts that trigger administrative review if users fail to respond within configured time limits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Database ODM**: Mongoose ODM with TypeScript models
- **Password Hashing**: bcrypt for secure password storage

### Data Storage Solutions
- **Primary Database**: MongoDB (local instance for development) - Migrated from PostgreSQL (July 28, 2025)
- **Session Storage**: Express sessions with memory storage
- **Asset Storage**: Configurable (Google Drive, DigiLocker, or local server)
- **Schema Management**: Mongoose schemas with TypeScript definitions

### Authentication and Authorization
- **Primary Auth**: Replit Auth for seamless integration
- **Fallback Auth**: Email/password and mobile OTP authentication
- **Session Security**: HTTP-only cookies with secure flags
- **Password Security**: bcrypt hashing with salt rounds
- **Admin Access**: Role-based access for administrative functions

## Key Components

### User Management System
- Multi-step registration process with validation
- Profile management with personal details
- Nominee management with verification status
- Well-being alert configuration and tracking

### Wellness Mood Tracking System ✓ COMPLETED
- Emoji-based mood selection with 12 different emotional states
- Quick mood logging with optional notes and context
- Compact dashboard widget for convenient daily check-ins
- Comprehensive mood tracking page with trends and analytics
- Real-time mood statistics and patterns visualization
- Integration with overall wellness monitoring system
- Database persistence with PostgreSQL storage
- RESTful API endpoints for mood data management
- Verified working through user testing (July 27, 2025)

### Contextual Self-Care Recommendation Engine ❌ REMOVED
- Feature has been completely removed from the system at user request
- All related code, database tables, and UI components have been cleaned up
- System now focuses on core posthumous notification functionality

### Asset Management System
- Support for multiple asset types (bank accounts, real estate, cryptocurrency, investments)
- Encrypted asset data storage
- Asset-specific contact information
- Configurable storage locations

### Well-being Alert System
- Configurable alert frequencies (daily/weekly)
- Counter-based tracking with user-defined limits
- Administrative review process for non-responsive users
- Automated escalation to customer care team

### Admin Dashboard ✓ COMPLETED
- User status monitoring and management
- Death validation and approval workflow
- Notification trigger controls
- System analytics and reporting

### Comprehensive Admin Panel ✓ COMPLETED
- **User Management**: Complete user administration with search, filtering, and status management
- **System Monitoring**: Real-time monitoring of users at risk and system health
- **Activity Logging**: Comprehensive audit trail with all system activities and admin actions
- **Risk Assessment**: Advanced user risk evaluation and management tools
- **Status Management**: User account activation, suspension, and deactivation with reason tracking
- **Search & Filtering**: Advanced filtering by status, risk level, and search functionality
- **Real-time Stats**: Dashboard with key metrics and system health indicators
- **Admin Authentication**: Secure admin-only access with proper authorization
- **Activity Categorization**: Organized logs by category (user, admin, system, security)
- **Severity Tracking**: Color-coded severity levels (info, warning, error, critical)
- **User Profile Management**: Detailed user information and account management
- Database integration with PostgreSQL for persistent storage
- RESTful API endpoints for all admin operations
- Verified working with comprehensive user management features (July 27, 2025)

### Recent Issues Fixed ❌→✓ (July 28, 2025)
- **Header Duplication**: Fixed duplicate "WellnessLegacy" headers on landing page using CSS isolation and hardware acceleration
- **404 Routing Error**: Removed problematic catch-all routes that were causing NotFound component to render alongside main content on all pages
- **Landing Page Display**: Clean rendering without visual duplicates or routing conflicts
- **Dashboard Display**: Fixed 404 errors appearing at bottom of authenticated pages
- **Mood Tracking API**: Fixed mood tracking errors by updating MongoDB schema intensity limit from 5 to 10
- **API Endpoint Routing**: Fixed wellness dashboard mood data fetching by correcting endpoint from `/api/mood-entries` to `/api/mood/entries`
- **AI Emotional Insights**: Completely removed AI Emotional Insights feature per user request, cleaned up all references
- **Admin Authentication**: Created dedicated admin login system with direct admin panel access
  - Admin credentials: admin@aulnovatechsoft.com / Admin@123
  - Admin login automatically redirects to /admin-panel
  - Removed admin panel button from regular user dashboard

## Data Flow

### User Registration Flow
1. Step 1: Personal information collection (name, DOB, mobile, address)
2. Step 2: Account creation (email, password, terms acceptance) - Security verification removed per user request (July 28, 2025)
3. Account verification and activation
4. Profile completion with nominee setup

### Asset Management Flow
1. Asset creation with type-specific forms
2. Encrypted data storage with chosen location
3. Contact information assignment
4. Regular asset updates and maintenance

### Well-being Alert Flow
1. Scheduled alerts based on user preferences
2. User response tracking and counter management
3. Escalation to admin team when limits exceeded
4. Manual validation and approval process
5. Posthumous notification dispatch to nominees

### Admin Workflow
1. Alert monitoring and user status review
2. Death validation through nominee contact
3. Asset notification approval and dispatch
4. System maintenance and user support

## External Dependencies

### Core Dependencies
- **mongoose**: MongoDB ODM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **bcrypt**: Password hashing and validation
- **mongodb**: MongoDB database system
- **express**: Web server framework
- **react-hook-form**: Form state management
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **eslint/prettier**: Code quality and formatting

### Third-party Integrations
- **Replit Auth**: Authentication provider
- **Google Drive API**: Asset storage option
- **DigiLocker API**: Government document storage
- **SMS Gateway**: OTP delivery service
- **Email Service**: Notification delivery

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- TypeScript compilation in watch mode
- Database migrations with Drizzle Kit
- Environment variable configuration

### Production Deployment
- Vite build for optimized frontend assets
- esbuild for Node.js backend bundling
- PostgreSQL database provisioning
- Environment-specific configuration
- SSL/TLS certificate management
- CDN integration for static assets

### Database Management
- Automated migrations with Drizzle Kit
- Connection pooling for performance
- Backup and recovery procedures
- Performance monitoring and optimization

### Security Considerations
- HTTPS enforcement in production
- CORS configuration for API endpoints
- Rate limiting for authentication endpoints
- Input validation and sanitization
- SQL injection prevention through ORM
- XSS protection with CSP headers