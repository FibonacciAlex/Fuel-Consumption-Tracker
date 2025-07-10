using System.Text;
using System.Text.Json;

namespace FuelTracker.API.Services
{
    public class GoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public GoogleAuthService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<bool> RevokeGoogleTokenAsync(string accessToken)
        {
            try
            {
                var clientId = _configuration["Authentication:Google:ClientId"];
                var clientSecret = _configuration["Authentication:Google:ClientSecret"];

                var requestData = new
                {
                    token = accessToken,
                    client_id = clientId,
                    client_secret = clientSecret
                };

                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/revoke", content);
                
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                // Log the exception in production
                Console.WriteLine($"Error revoking Google token: {ex.Message}");
                return false;
            }
        }

        public string GetGoogleLogoutUrl(string redirectUri = null)
        {
            var baseUrl = "https://accounts.google.com/logout";
            
            if (!string.IsNullOrEmpty(redirectUri))
            {
                return $"{baseUrl}?continue={Uri.EscapeDataString(redirectUri)}";
            }
            
            return baseUrl;
        }
    }
} 