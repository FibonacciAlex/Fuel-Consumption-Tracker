using System.ComponentModel.DataAnnotations;

namespace FuelTracker.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string GoogleId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        public bool IsAdmin { get; set; } = false;
        
        // Navigation property
        public virtual ICollection<FuelRecord> FuelRecords { get; set; } = new List<FuelRecord>();
    }
} 