using Microsoft.EntityFrameworkCore;
using FuelTracker.API.Models;

namespace FuelTracker.API.Data
{
    public class FuelTrackerContext : DbContext
    {
        public FuelTrackerContext(DbContextOptions<FuelTrackerContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<FuelRecord> FuelRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.GoogleId).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsAdmin).HasDefaultValue(false);
                
                // Create unique indexes
                entity.HasIndex(e => e.GoogleId).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure FuelRecord entity
            modelBuilder.Entity<FuelRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Date).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.LicensePlate).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Filled).HasDefaultValue(false);
                entity.Property(e => e.Odometer).IsRequired().HasColumnType("decimal(10,2)");
                
                // Configure foreign key relationship
                entity.HasOne(e => e.User)
                      .WithMany(u => u.FuelRecords)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
} 