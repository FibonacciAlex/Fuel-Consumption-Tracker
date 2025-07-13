# Fuel Consumption Tracker - C# Backend

A fuel consumption tracking backend API built with C# and ASP.NET Core.

## Features

- Google OAuth Authentication
- JWT Token Authentication
- Fuel Record Management (CRUD operations)
- User Management
- SQLite Database
- RESTful API
- Swagger Documentation

## Technology Stack

- ASP.NET Core 8.0
- Entity Framework Core
- SQLite
- JWT Authentication
- Google OAuth
- Swagger/OpenAPI

## Installation and Setup

### Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022 or VS Code

### Configuration

1. Copy `appsettings.json` and modify the configuration as needed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=fuel_consumption_tracker.db"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Jwt": {
      "Key": "your-super-secret-jwt-key-with-at-least-32-characters",
      "Issuer": "FuelTrackerAPI",
      "Audience": "FuelTrackerClient",
      "ExpiryInMinutes": 60
    }
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"]
  }
}
```

2. Set up Google OAuth:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set the authorized redirect URI to: `https://localhost:5001/auth/google/callback`

### Running the Application

#### For the vscode in windows

1. Set up the settings file 
```
{
    "omnisharp.useModernNet": true,
    "omnisharp.sdkPath": "C:\\Program Files\\dotnet",  //Your own system path to the dotnet sdk
    "omnisharp.enableMsBuildSdksDownload": false
}
  
```

2. Build the project sln
```bash
dotnet build FuelTracker.sln
```

2. Run the application:
```bash
dotnet run --project FuelTracker.API.csproj
```

#### For other OS

1. Restore NuGet packages:
```bash
dotnet restore
```

2. Run the application:
```bash
dotnet run
```

3. Access Swagger documentation:
   - https://localhost:5001/swagger

## OAuth Flow Process

For this server, the workflow is a little bit difference:
```
Incoming Request: /auth/google/callback
       ↓
[CORS Middleware] → passes through
       ↓
[Authentication Middleware] → INTERCEPTS! 
       ↓                      ↓
[Your Controller]        [Processes Google callback]
   (never reached)            ↓
                         [Sends 302 redirect response]
```
The ASP.NET GoogleExtensions Middleware will handle the callback Request automatically and response 302, so we can not use the callback URL as the API endpoint, we need to watch the OnTicketReceived event and Process our own token generated logic.
## API Endpoints

### Authentication Endpoints

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/user` - Get current user information
- `POST /auth/logout` - User logout

### Fuel Record Endpoints

- `POST /api/fuel-records` - Create a new fuel record
- `GET /api/fuel-records` - Get fuel records list (with filtering support)
- `PUT /api/fuel-records/{id}` - Update a fuel record
- `DELETE /api/fuel-records/{id}` - Delete a fuel record

## Database

The application uses SQLite database, which will be automatically created on first run.

### Table Structure

#### Users Table
- Id (INTEGER PRIMARY KEY)
- GoogleId (VARCHAR(255) UNIQUE)
- Name (VARCHAR(255))
- Email (VARCHAR(255) UNIQUE)
- IsAdmin (BOOLEAN)

#### FuelRecords Table
- Id (INTEGER PRIMARY KEY)
- UserId (INTEGER FOREIGN KEY)
- Date (VARCHAR(10))
- Amount (DECIMAL(10,2))
- Price (DECIMAL(10,2))
- LicensePlate (VARCHAR(20))
- Filled (BOOLEAN)
- Odometer (DECIMAL(10,2))

## Authentication Flow

1. User visits `/auth/google` to initiate Google OAuth flow
2. After completing Google authentication, user is redirected to `/auth/google/callback`
3. System checks if user exists, creates new user if not
4. JWT token is generated and user is redirected to frontend
5. Frontend uses JWT token for subsequent API calls

## Development

### Project Structure

```
backend-csharp/
├── Controllers/          # API Controllers
├── Data/                # Database Context
├── DTOs/                # Data Transfer Objects
├── Models/              # Entity Models
├── Services/            # Business Logic Services
├── Program.cs           # Application Entry Point
├── appsettings.json     # Configuration File
└── FuelTracker.API.csproj # Project File
```

### Adding New Features

1. Add new entity models in `Models/`
2. Add data transfer objects in `DTOs/`
3. Add business logic in `Services/`
4. Add API endpoints in `Controllers/`
5. Update `Data/FuelTrackerContext.cs` to configure new entities

## Deployment

### Production Environment Configuration

1. Update production environment settings in `appsettings.json`
2. Set a strong password for JWT key
3. Configure proper CORS policy
4. Use HTTPS

### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FuelTracker.API.csproj", "./"]
RUN dotnet restore "FuelTracker.API.csproj"
COPY . .
RUN dotnet build "FuelTracker.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FuelTracker.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FuelTracker.API.dll"]
```

## License

MIT License 