using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FuelTracker.API.Models;

namespace FuelTracker.API.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private static readonly HashSet<string> _blacklistedTokens = new();

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Authentication:Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"]!);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim("GoogleId", user.GoogleId),
                    new Claim("IsAdmin", user.IsAdmin.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiryInMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            // Check if token is blacklisted
            if (_blacklistedTokens.Contains(token))
            {
                return null;
            }

            var jwtSettings = _configuration.GetSection("Authentication:Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        public void BlacklistToken(string token)
        {
            _blacklistedTokens.Add(token);
        }

        public bool IsTokenBlacklisted(string token)
        {
            return _blacklistedTokens.Contains(token);
        }

        // Clean up expired tokens from blacklist (call this periodically)
        public void CleanupExpiredTokens()
        {
            var jwtSettings = _configuration.GetSection("Authentication:Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = false, // Don't validate lifetime for cleanup
                ClockSkew = TimeSpan.Zero
            };

            var tokensToRemove = new List<string>();

            foreach (var token in _blacklistedTokens)
            {
                try
                {
                    var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                    if (validatedToken.ValidTo < DateTime.UtcNow)
                    {
                        tokensToRemove.Add(token);
                    }
                }
                catch
                {
                    // Token is invalid, remove it
                    tokensToRemove.Add(token);
                }
            }

            foreach (var token in tokensToRemove)
            {
                _blacklistedTokens.Remove(token);
            }
        }
    }
} 