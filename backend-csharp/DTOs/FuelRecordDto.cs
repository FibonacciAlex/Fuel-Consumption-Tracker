namespace FuelTracker.API.DTOs
{
    public class FuelRecordDto
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Price { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public bool IsFull { get; set; }
        public decimal Odometer { get; set; }
    }

    public class CreateFuelRecordDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Price { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public bool IsFull { get; set; }
        public decimal Odometer { get; set; }
    }

    public class UpdateFuelRecordDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Price { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public bool IsFull { get; set; }
        public decimal Odometer { get; set; }
    }

    public class FuelRecordFilterDto
    {
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? LicensePlate { get; set; }
    }
} 