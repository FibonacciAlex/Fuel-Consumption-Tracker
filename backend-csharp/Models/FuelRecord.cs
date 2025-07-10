using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuelTracker.API.Models
{
    public class FuelRecord
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string Date { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;
        
        public bool Filled { get; set; } = false;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Odometer { get; set; }
        
        // Navigation property
        public virtual User User { get; set; } = null!;
    }
} 