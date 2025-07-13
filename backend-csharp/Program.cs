using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FuelTracker.API.Data;
using FuelTracker.API.Services;
using System.Security.Claims;
using FuelTracker.API.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpClient for Google OAuth2 operations
builder.Services.AddHttpClient();

// Add DbContext
builder.Services.AddDbContext<FuelTrackerContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<FuelRecordService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<GoogleAuthService>();

// Add background service for token cleanup
builder.Services.AddHostedService<TokenCleanupService>();

// Add cookie policy configuration for development
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.Lax;
    options.OnAppendCookie = cookieContext =>
    {
        if (builder.Environment.IsDevelopment())
        {
            cookieContext.CookieOptions.SameSite = SameSiteMode.Lax;
            cookieContext.CookieOptions.Secure = false;
        }
    };
    options.OnDeleteCookie = cookieContext =>
    {
        if (builder.Environment.IsDevelopment())
        {
            cookieContext.CookieOptions.SameSite = SameSiteMode.Lax;
            cookieContext.CookieOptions.Secure = false;
        }
    };
});

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new string[0];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure Google Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = "External";
})
.AddCookie("External")
.AddGoogle(options =>
{
    var googleSection = builder.Configuration.GetSection("Authentication:Google");
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;

    var callbackUrl = googleSection["CallbackUrl"];
    options.CallbackPath = !string.IsNullOrEmpty(callbackUrl)
        ? new PathString(new Uri(callbackUrl).AbsolutePath)
        : new PathString("/auth/google/callback");
    // options.Events.OnTicketReceived = async context =>
    // {
    //     // Custom logic after receiving the ticket
    //     context.ReturnUri = "/auth/google/success";

    // };
    options.Events.OnTicketReceived = async context =>
    {
        try
        {
            var claims = context.Principal?.Claims.ToList();
            var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var gname = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (!string.IsNullOrEmpty(googleId) && !string.IsNullOrEmpty(email))
            {
                // Get services from DI container
                var userService = context.HttpContext.RequestServices.GetRequiredService<UserService>();
                var jwtService = context.HttpContext.RequestServices.GetRequiredService<JwtService>();

                // Your user creation/retrieval logic
                var user = await userService.GetUserByGoogleIdAsync(googleId);
                if (user == null)
                {
                    var userInfo = new GoogleUserInfo
                    {
                        GoogleId = googleId,
                        Name = gname,
                        Email = email
                    };
                    user = await userService.CreateUserAsync(userInfo);
                }

                // Generate JWT token
                var token = jwtService.GenerateToken(user);

                // Redirect to frontend with token
                var frontendUrl = "http://localhost:5173";
                context.ReturnUri = $"{frontendUrl}?token={token}";
            }
        }
        catch (Exception ex)
        {
            // Handle errors
            Console.WriteLine($"Error in OnTicketReceived: {ex.Message}");
            context.ReturnUri = "http://localhost:5173?error=auth_failed";
        }
    };
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("Authentication:Jwt");
    var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
    var issuer = jwtSettings["Issuer"];
    var audience = jwtSettings["Audience"];

    options.TokenValidationParameters = new TokenValidationParameters
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
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

// Add cookie policy middleware before authentication
app.UseCookiePolicy();

// Add JWT blacklist middleware before authentication
app.UseMiddleware<FuelTracker.API.Middleware.JwtBlacklistMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FuelTrackerContext>();
    context.Database.EnsureCreated();
}

app.Run(); 