using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FuelTracker.API.Services
{
    public class TokenCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TokenCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1); // Clean up every hour

        public TokenCleanupService(IServiceProvider serviceProvider, ILogger<TokenCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var jwtService = scope.ServiceProvider.GetRequiredService<JwtService>();
                    
                    jwtService.CleanupExpiredTokens();
                    _logger.LogInformation("Token cleanup completed successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during token cleanup");
                }

                await Task.Delay(_cleanupInterval, stoppingToken);
            }
        }
    }
} 