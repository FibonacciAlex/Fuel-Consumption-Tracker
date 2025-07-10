using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using FuelTracker.API.Services;
using FuelTracker.API.DTOs;

namespace FuelTracker.API.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class FuelRecordController : ControllerBase
    {
        private readonly FuelRecordService _fuelRecordService;

        public FuelRecordController(FuelRecordService fuelRecordService)
        {
            _fuelRecordService = fuelRecordService;
        }

        [HttpPost("fuel-records")]
        public async Task<IActionResult> AddFuelRecord([FromBody] CreateFuelRecordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Unauthorized: Login required" });
            }

            try
            {
                var fuelRecord = await _fuelRecordService.CreateFuelRecordAsync(userId, dto);
                return StatusCode(201, new { message = "Fuel record added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to add fuel record" });
            }
        }

        [HttpGet("fuel-records")]
        public async Task<IActionResult> GetFuelRecords([FromQuery] string? startDate, [FromQuery] string? endDate, [FromQuery] string? licensePlate)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdminClaim = User.FindFirst("IsAdmin")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Unauthorized: Login required" });
            }

            var isAdmin = bool.TryParse(isAdminClaim, out var admin) && admin;

            try
            {
                var filters = new FuelRecordFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    LicensePlate = licensePlate
                };

                var records = await _fuelRecordService.GetFuelRecordsAsync(userId, isAdmin, filters);
                return Ok(records);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("fuel-records/{id}")]
        public async Task<IActionResult> UpdateFuelRecord(int id, [FromBody] UpdateFuelRecordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdminClaim = User.FindFirst("IsAdmin")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Unauthorized: Login required" });
            }

            var isAdmin = bool.TryParse(isAdminClaim, out var admin) && admin;

            // Check if user can access this record
            var canAccess = await _fuelRecordService.CanUserAccessRecordAsync(userId, isAdmin, id);
            if (!canAccess)
            {
                return Forbid();
            }

            try
            {
                var success = await _fuelRecordService.UpdateFuelRecordAsync(id, dto);
                if (!success)
                {
                    return NotFound(new { error = "Fuel record not found" });
                }

                return Ok(new { message = "Fuel record updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update fuel record" });
            }
        }

        [HttpDelete("fuel-records/{id}")]
        public async Task<IActionResult> DeleteFuelRecord(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdminClaim = User.FindFirst("IsAdmin")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Unauthorized: Login required" });
            }

            var isAdmin = bool.TryParse(isAdminClaim, out var admin) && admin;

            // Check if user can access this record
            var canAccess = await _fuelRecordService.CanUserAccessRecordAsync(userId, isAdmin, id);
            if (!canAccess)
            {
                return Forbid();
            }

            try
            {
                var success = await _fuelRecordService.DeleteFuelRecordAsync(id);
                if (!success)
                {
                    return NotFound(new { error = "Fuel record not found" });
                }

                return Ok(new { message = "Fuel record deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete fuel record" });
            }
        }
    }
} 