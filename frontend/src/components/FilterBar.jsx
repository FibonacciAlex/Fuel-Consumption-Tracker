import { useState, useEffect } from 'react';

function FilterBar({ records, onFilterChange, onSearch }) {
  // Helper function to calculate the default date range (last 7 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    return {
      start: lastWeek.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end: today.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  };

  // Initialize dateRange with the default date range (last 7 days)
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedPlates, setSelectedPlates] = useState([]);

  const uniquePlates = [...new Set(records.map(record => record.licensePlate))];

  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
  };

  const handlePlateChange = (plate) => {
    const newSelectedPlates = selectedPlates.includes(plate)
      ? selectedPlates.filter(p => p !== plate)
      : [...selectedPlates, plate];
    
    setSelectedPlates(newSelectedPlates);
  };

  const search = () => {
    onFilterChange({
      dateRange,
      licensePlates: selectedPlates,
    });
    onSearch({
      startDate: dateRange.start,
      endDate: dateRange.end,
      licensePlates: selectedPlates,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Plates</label>
          <div className="flex flex-wrap gap-2">
            {uniquePlates.map(plate => (
              <button
                key={plate}
                onClick={() => handlePlateChange(plate)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedPlates.includes(plate)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {plate}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={search}
        className="mt-4 text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
      >
        Search
      </button>
    </div>
  );
}

export default FilterBar;