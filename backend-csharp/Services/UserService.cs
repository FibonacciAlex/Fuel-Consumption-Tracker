using Microsoft.EntityFrameworkCore;
using FuelTracker.API.Data;
using FuelTracker.API.Models;
using FuelTracker.API.DTOs;

namespace FuelTracker.API.Services
{
    public class UserService
    {
        private readonly FuelTrackerContext _context;

        public UserService(FuelTrackerContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByGoogleIdAsync(string googleId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        public async Task<User> CreateUserAsync(GoogleUserInfo userInfo)
        {
            var user = new User
            {
                GoogleId = userInfo.GoogleId,
                Name = userInfo.Name,
                Email = userInfo.Email,
                IsAdmin = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<UserDto?> GetUserDtoByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsAdmin = user.IsAdmin
            };
        }
    }
} 