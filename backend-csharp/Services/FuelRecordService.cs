using Microsoft.EntityFrameworkCore;
using FuelTracker.API.Data;
using FuelTracker.API.Models;
using FuelTracker.API.DTOs;

namespace FuelTracker.API.Services
{
    public class FuelRecordService
    {
        private readonly FuelTrackerContext _context;

        public FuelRecordService(FuelTrackerContext context)
        {
            _context = context;
        }

        public async Task<FuelRecord> CreateFuelRecordAsync(int userId, CreateFuelRecordDto dto)
        {
            var fuelRecord = new FuelRecord
            {
                UserId = userId,
                Date = dto.Date,
                Amount = dto.Amount,
                Price = dto.Price,
                LicensePlate = dto.LicensePlate,
                Filled = dto.IsFull,
                Odometer = dto.Odometer
            };

            _context.FuelRecords.Add(fuelRecord);
            await _context.SaveChangesAsync();
            return fuelRecord;
        }

        public async Task<List<FuelRecordDto>> GetFuelRecordsAsync(int userId, bool isAdmin, FuelRecordFilterDto? filters = null)
        {
            var query = _context.FuelRecords.AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(fr => fr.UserId == userId);
            }

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.StartDate))
                {
                    query = query.Where(fr => string.Compare(fr.Date, filters.StartDate) >= 0);
                }

                if (!string.IsNullOrEmpty(filters.EndDate))
                {
                    query = query.Where(fr => string.Compare(fr.Date, filters.EndDate) <= 0);
                }

                if (!string.IsNullOrEmpty(filters.LicensePlate))
                {
                    query = query.Where(fr => fr.LicensePlate == filters.LicensePlate);
                }
            }

            var records = await query
                .OrderByDescending(fr => fr.Date)
                .ToListAsync();

            return records.Select(fr => new FuelRecordDto
            {
                Id = fr.Id,
                Date = fr.Date,
                Amount = fr.Amount,
                Price = fr.Price,
                LicensePlate = fr.LicensePlate,
                IsFull = fr.Filled,
                Odometer = fr.Odometer
            }).ToList();
        }

        public async Task<FuelRecord?> GetFuelRecordByIdAsync(int id)
        {
            return await _context.FuelRecords.FindAsync(id);
        }

        public async Task<bool> UpdateFuelRecordAsync(int id, UpdateFuelRecordDto dto)
        {
            var fuelRecord = await _context.FuelRecords.FindAsync(id);
            if (fuelRecord == null)
                return false;

            fuelRecord.Date = dto.Date;
            fuelRecord.Amount = dto.Amount;
            fuelRecord.Price = dto.Price;
            fuelRecord.LicensePlate = dto.LicensePlate;
            fuelRecord.Filled = dto.IsFull;
            fuelRecord.Odometer = dto.Odometer;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteFuelRecordAsync(int id)
        {
            var fuelRecord = await _context.FuelRecords.FindAsync(id);
            if (fuelRecord == null)
                return false;

            _context.FuelRecords.Remove(fuelRecord);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CanUserAccessRecordAsync(int userId, bool isAdmin, int recordId)
        {
            if (isAdmin) return true;

            var record = await _context.FuelRecords.FindAsync(recordId);
            return record?.UserId == userId;
        }
    }
} 