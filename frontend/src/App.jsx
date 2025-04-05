import { useState, useEffect, useMemo } from 'react';
import FuelForm from './components/FuelForm';
import FuelList from './components/FuelList';
import Statistics from './components/Statistics';
import CostAnalysis from './components/CostAnalysis';
import FilterBar from './components/FilterBar';
import { getFuelRecords } from './utils/storage';

function App() {
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);

  // Set the default date range to the last 7 days in YYYY-MM-DD format
  const getDefaultDateRange = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    return {
      start: lastWeek.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end: today.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  };

  const [filters, setFilters] = useState({
    dateRange: getDefaultDateRange(), // Default to the last 7 days
    licensePlates: [],
  });

  // Load records using the default time period or filters
  const loadRecords = async () => {
    const { start, end } = filters.dateRange; // Use the date range from filters
    const savedRecords = await getFuelRecords(start, end); // Fetch records within the date range
    setRecords(savedRecords || []); // Set the fetched records
  };

  // Trigger loading records when filters change
  useEffect(() => {
    loadRecords();
  }, [filters]);

  // Handle search triggered by the FilterBar
  const handleSearch = ({ startDate, endDate, licensePlates }) => {
    setFilters({
      dateRange: { start: startDate, end: endDate },
      licensePlates,
    });
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter(record => {
      const date = new Date(record.date);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      const meetsDateRange = (
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate)
      );

      const meetsPlateFilter = (
        filters.licensePlates.length === 0 ||
        filters.licensePlates.includes(record.licensePlate)
      );

      return meetsDateRange && meetsPlateFilter;
    });
  }, [records, filters]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Vehicle Fuel Consumption Tracker
        </h1>
        <FuelForm 
          onRecordAdded={loadRecords} 
          editRecord={editRecord}
          setEditRecord={setEditRecord}
        />
        <FilterBar 
          records={records}
          onFilterChange={setFilters}
          onSearch={handleSearch} // Pass the search handler
        />
        <CostAnalysis records={filteredRecords} />
        <Statistics records={filteredRecords} />
        <FuelList 
          records={filteredRecords} 
          onRecordDeleted={loadRecords}
          onEditRecord={setEditRecord}
        />
      </div>
    </div>
  );
}

export default App;