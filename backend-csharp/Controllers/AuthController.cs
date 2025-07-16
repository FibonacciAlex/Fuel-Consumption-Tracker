using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using System.Security.Claims;
using FuelTracker.API.Services;
using FuelTracker.API.DTOs;

namespace FuelTracker.API.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtService _jwtService;
        private readonly GoogleAuthService _googleAuthService;

        public AuthController(UserService userService, JwtService jwtService, GoogleAuthService googleAuthService)
        {
            _userService = userService;
            _jwtService = jwtService;
            _googleAuthService = googleAuthService;
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                // RedirectUri = Url.Action(nameof(GoogleCallback))
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        // [HttpGet("google/callback")]
        // [HttpGet("google/success")]
        // public async Task<IActionResult> GoogleCallback()
        // {
        //     Console.WriteLine("GoogleCallback hit!");
        //     var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        //
        //     if (!result.Succeeded)
        //     {
        //         return BadRequest(new { error = "Google authentication failed" });
        //     }
        //
        //     var claims = result.Principal?.Claims.ToList();
        //     var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        //     var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        //     var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        //
        //     if (string.IsNullOrEmpty(googleId) || string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email))
        //     {
        //         return BadRequest(new { error = "Invalid user information from Google" });
        //     }
        //
        //     // Check if user exists, create if not
        //     var user = await _userService.GetUserByGoogleIdAsync(googleId);
        //     if (user == null)
        //     {
        //         var userInfo = new GoogleUserInfo
        //         {
        //             GoogleId = googleId,
        //             Name = name,
        //             Email = email
        //         };
        //         user = await _userService.CreateUserAsync(userInfo);
        //     }
        //
        //     // Generate JWT token
        //     var token = _jwtService.GenerateToken(user);
        //
        //     // Redirect to frontend with token
        //     var frontendUrl = "http://localhost:5173"; // Update this with your frontend URL
        //     return Redirect($"{frontendUrl}?token={token}");
        // }

        [HttpGet("user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Unauthorized" });
            }

            var user = await _userService.GetUserDtoByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new { user });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            try
            {
                // Get the current user's token from the Authorization header
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                var token = authHeader?.Replace("Bearer ", "");

                if (!string.IsNullOrEmpty(token))
                {
                    // Blacklist the JWT token
                    _jwtService.BlacklistToken(token);

                    // If we have a Google access token, try to revoke it
                    if (!string.IsNullOrEmpty(request?.GoogleAccessToken))
                    {
                        await _googleAuthService.RevokeGoogleTokenAsync(request.GoogleAccessToken);
                    }
                }

                var response = new
                {
                    message = "Logged out successfully",
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred during logout", details = ex.Message });
            }
        }

        [HttpGet("logout/google")]
        public IActionResult GetGoogleLogoutUrl([FromQuery] string redirectUri = null)
        {
            var logoutUrl = _googleAuthService.GetGoogleLogoutUrl(redirectUri);
            return Ok(new { logoutUrl });
        }

    }

    public class LogoutRequest
    {
        public string? GoogleAccessToken { get; set; }
    }
} 