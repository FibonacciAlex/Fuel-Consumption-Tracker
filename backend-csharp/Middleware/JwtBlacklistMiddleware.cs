using Microsoft.AspNetCore.Http;
using FuelTracker.API.Services;

namespace FuelTracker.API.Middleware
{
    public class JwtBlacklistMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtBlacklistMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, JwtService jwtService)
        {

        
            
            var token = context.Request.Headers["Authorization"]
                .FirstOrDefault()?.Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token) && jwtService.IsTokenBlacklisted(token))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { error = "Token has been revoked" });
                return;
            }

            await _next(context);
        }
    }
}