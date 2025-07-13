# Environment Configuration Setup

This document explains how to configure different environments (Development, Staging, Production) for the Fuel Consumption Tracker API.

## Environment Configuration Files

The application uses ASP.NET Core's built-in configuration system with the following files:

- `appsettings.json` - Base configuration (applies to all environments)
- `appsettings.Development.json` - Development-specific settings
- `appsettings.Staging.json` - Staging-specific settings  
- `appsettings.Production.json` - Production-specific settings

## How to Set the Environment

### 1. Using Environment Variables

Set the `ASPNETCORE_ENVIRONMENT` environment variable:

**Windows (PowerShell):**
```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

**Windows (Command Prompt):**
```cmd
set ASPNETCORE_ENVIRONMENT=Development
dotnet run
```

**Linux/macOS:**
```bash
export ASPNETCORE_ENVIRONMENT=Development
dotnet run
```

### 2. Using Launch Profiles

The `Properties/launchSettings.json` file already configures the environment for different launch profiles:

- **Development**: `ASPNETCORE_ENVIRONMENT=Development`
- **HTTPS**: `ASPNETCORE_ENVIRONMENT=Development`
- **IIS Express**: `ASPNETCORE_ENVIRONMENT=Development`

### 3. Using Command Line Arguments

```bash
dotnet run --environment Development
dotnet run --environment Production
dotnet run --environment Staging
```

### 4. Using Docker

Add environment variable to your Docker run command:

```bash
docker run -e ASPNETCORE_ENVIRONMENT=Production your-app
```

Or in docker-compose.yml:
```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Production
```

## Environment-Specific Settings

### Development Environment
- **Logging**: Detailed logging with SQL queries visible
- **Database**: Local SQLite database
- **CORS**: Allows localhost origins (3000, 5173)
- **JWT**: 60-minute expiry
- **Google Auth**: Development OAuth credentials

### Staging Environment
- **Logging**: Moderate logging level
- **Database**: Separate staging database
- **CORS**: Configure for staging domain
- **JWT**: 45-minute expiry
- **Google Auth**: Staging OAuth credentials

### Production Environment
- **Logging**: Warning level only (minimal logging)
- **Database**: Production database
- **CORS**: Configure for production domain
- **JWT**: 30-minute expiry (more secure)
- **Google Auth**: Production OAuth credentials

## Security Best Practices

### For Production:

1. **Never commit sensitive data** to source control
2. **Use environment variables** for secrets:
   ```bash
   export JWT_KEY="your-secure-jwt-key"
   export GOOGLE_CLIENT_SECRET="your-google-secret"
   ```

3. **Use Azure Key Vault, AWS Secrets Manager, or similar** for production secrets

4. **Configure proper CORS** for your production domain

5. **Use HTTPS only** in production

### Environment Variable Configuration

You can override any setting using environment variables with the format:
```
Section__Subsection__Key
```

Examples:
```bash
export Authentication__Jwt__Key="your-jwt-key"
export Authentication__Google__ClientId="your-google-client-id"
export ConnectionStrings__DefaultConnection="your-connection-string"
```

## Configuration Hierarchy

ASP.NET Core loads configuration in this order (later values override earlier ones):

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Environment variables
4. Command line arguments

## Troubleshooting

### Check Current Environment
Add this to your controller to verify the current environment:
```csharp
[HttpGet("environment")]
public IActionResult GetEnvironment()
{
    return Ok(new { 
        Environment = _environment.EnvironmentName,
        IsDevelopment = _environment.IsDevelopment(),
        IsProduction = _environment.IsProduction()
    });
}
```

### Common Issues

1. **Environment not set**: Defaults to "Production"
2. **Case sensitivity**: Environment names are case-sensitive
3. **Configuration not loading**: Check file names match exactly

## Next Steps

1. Update your production deployment scripts to set the correct environment
2. Configure your CI/CD pipeline to use appropriate environments
3. Set up proper secrets management for production
4. Test each environment configuration thoroughly 