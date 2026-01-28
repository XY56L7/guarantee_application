# Backend Clean Architecture Documentation - NestJS

This documentation describes the backend clean architecture structure with NestJS and Express.js.

## 📁 Project Structure

```
backend/
├── src/
│   ├── domain/                    # Domain Layer (Business Logic)
│   │   ├── entities/              # Entities
│   │   │   ├── user.entity.ts
│   │   │   └── guarantee-check.entity.ts
│   │   ├── repositories/          # Repository Interfaces
│   │   │   ├── user.repository.interface.ts
│   │   │   └── guarantee-check.repository.interface.ts
│   │   └── services/              # Domain Services
│   │       └── auth.domain.service.ts
│   ├── application/               # Application Layer (Use Cases)
│   │   ├── dto/                   # Data Transfer Objects
│   │   │   ├── auth.dto.ts
│   │   │   ├── user.dto.ts
│   │   │   └── guarantee-check.dto.ts
│   │   └── use-cases/             # Use Cases
│   │       ├── auth/
│   │       │   ├── signup.use-case.ts
│   │       │   └── login.use-case.ts
│   │       ├── user/
│   │       │   ├── get-profile.use-case.ts
│   │       │   └── update-profile.use-case.ts
│   │       └── guarantee-check/
│   │           ├── create-guarantee-check.use-case.ts
│   │           ├── get-guarantee-checks.use-case.ts
│   │           ├── get-guarantee-check-by-id.use-case.ts
│   │           ├── update-guarantee-check.use-case.ts
│   │           ├── delete-guarantee-check.use-case.ts
│   │           └── get-guarantee-check-stats.use-case.ts
│   ├── infrastructure/            # Infrastructure Layer (Implementations)
│   │   ├── repositories/          # Repository Implementations
│   │   │   ├── user.repository.ts
│   │   │   └── guarantee-check.repository.ts
│   │   ├── auth/                  # Authentication Infrastructure
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   └── modules/               # NestJS Modules
│   │       └── app.module.ts
│   ├── persistence/               # Persistence Layer (Database)
│   │   ├── database/
│   │   │   └── in-memory.database.ts
│   │   └── seed/
│   │       └── seed.service.ts
│   ├── presentation/               # Presentation Layer (Controllers)
│   │   └── controllers/
│   │       ├── app.controller.ts
│   │       ├── auth.controller.ts
│   │       ├── users.controller.ts
│   │       └── guarantee-checks.controller.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🏗️ Clean Architecture Layers

### 1. **Domain Layer** (Business Logic Layer)
- **Responsibility**: Business rules, entities, domain logic
- **Components**:
  - **Entities**: Business entities (`User`, `GuaranteeCheck`)
  - **Repository Interfaces**: Data access interfaces
  - **Domain Services**: Domain-specific logic

**Example**: `User` entity, `IUserRepository` interface

### 2. **Application Layer** (Application Layer)
- **Responsibility**: Use cases, DTOs, application logic
- **Components**:
  - **DTOs**: Data Transfer Objects (with validation)
  - **Use Cases**: Business operations implementation

**Example**: `SignupUseCase`, `LoginUseCase`, `CreateGuaranteeCheckUseCase`

### 3. **Infrastructure Layer** (Infrastructure Layer)
- **Responsibility**: External services implementation
- **Components**:
  - **Repository Implementations**: Repository interface implementations
  - **Auth Infrastructure**: Guards, strategies
  - **Modules**: NestJS module configuration

**Example**: `UserRepository`, `GuaranteeCheckRepository`, `JwtAuthGuard`, `JwtStrategy`

### 4. **Persistence Layer** (Data Persistence Layer)
- **Responsibility**: Database connection, data storage
- **Components**:
  - **Database**: Database configuration and management
  - **Seed**: Initial data loading

**Example**: `InMemoryDatabase`, `SeedService`

### 5. **Presentation Layer** (Interface Layer)
- **Responsibility**: HTTP request/response handling
- **Components**:
  - **Controllers**: REST API endpoints

**Example**: `AuthController`, `UsersController`, `GuaranteeChecksController`

## 🔄 Data Flow

```
HTTP Request
    ↓
Controller (Presentation Layer)
    ↓
Use Case (Application Layer)
    ↓
Domain Service (Domain Layer) [optional]
    ↓
Repository Interface (Domain Layer)
    ↓
Repository Implementation (Infrastructure Layer)
    ↓
Database (Persistence Layer)
    ↓
Response back through all layers
```

## 📋 Example: User Registration

1. **Controller** (`auth.controller.ts`): `POST /api/auth/signup`
2. **Use Case** (`signup.use-case.ts`): 
   - Validation (Domain Service)
   - Password hashing
   - User creation (Repository)
   - JWT token generation
3. **Repository** (`user.repository.ts`): Data saving
4. **Database** (`in-memory.database.ts`): Data storage
5. **Response**: Back to Controller

## ✅ Benefits

1. **Separation of Concerns**: Each layer has clear responsibility
2. **Dependency Inversion**: Domain layer doesn't depend on external layers
3. **Testability**: Easy to test because layers are independent
4. **Maintainability**: Easy to maintain and extend
5. **Scalability**: Easy to scale with new features
6. **Pure Clean Architecture**: Organized only by layers, not by features

## 🔧 Maintenance

### Adding a new use case:
1. Create DTO in `application/dto/`
2. Create Use Case in `application/use-cases/`
3. Add Controller method in `presentation/controllers/`
4. Register provider in `infrastructure/modules/app.module.ts`

### Adding a new entity:
1. Create Entity in `domain/entities/`
2. Create Repository interface in `domain/repositories/`
3. Create Repository implementation in `infrastructure/repositories/`
4. Add Database methods in `persistence/database/`

## 📝 Notes

- **NestJS**: Modular, dependency injection based framework
- **Express.js**: Base HTTP server (runs under NestJS)
- **TypeScript**: Type safety
- **In-Memory Database**: For development purposes (easily replaceable with real database)
- **JWT Authentication**: Using Passport.js strategy
- **Pure Clean Architecture**: Only layer-based organization, no feature-based folders

## 🚀 Installation and Running

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 🔐 Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```
