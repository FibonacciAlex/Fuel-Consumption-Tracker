import { useState, useEffect, useMemo } from 'react';
import FuelForm from './components/FuelForm';
import FuelList from './components/FuelList';
import Statistics from './components/Statistics';
import CostAnalysis from './components/CostAnalysis';
import FilterBar from './components/FilterBar';
import LoginButton from './components/LoginButton';
import { getFuelRecords } from './utils/storage';
import { useAuth } from './hooks/useAuth';

function App() {
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: getDefaultDateRange(),
    licensePlates: [],
  });
  const [authError, setAuthError] = useState(false);

  const { user, loading, error, login, logout, fetchUser } = useAuth();

  useEffect(() => {
    // check URL to see if there is an authentication error
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth_failed') {
      setAuthError(true);
    }
  }, []);

  function getDefaultDateRange() {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    return {
      start: lastWeek.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  }

  const loadRecords = async () => {
    if (!user) return; // Do not load records if user is not logged in
    const { start, end } = filters.dateRange;
    const savedRecords = await getFuelRecords(start, end);
    setRecords(savedRecords || []);
  };

  useEffect(() => {
    loadRecords();
  }, [filters, user]);

  const handleSearch = ({ startDate, endDate, licensePlates }) => {
    setFilters({
      dateRange: { start: startDate, end: endDate },
      licensePlates: licensePlates || [], // Ensure licensePlates is an array
    });
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter((record) => {
      const date = new Date(record.date);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      const meetsDateRange =
        (!startDate || date >= startDate) && (!endDate || date <= endDate);
      const meetsPlateFilter =
        filters.licensePlates.length === 0 ||
        filters.licensePlates.includes(record.licensePlate);
      return meetsDateRange && meetsPlateFilter;
    });
  }, [records, filters]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Vehicle Fuel Consumption Tracker
        </h1>
        <LoginButton user={user} loading={loading} error={error} login={login} logout={logout} />
        {error && (
          <div className="text-center text-red-600 mb-2">
            {error}
            {error.includes('Network') && (
              <button
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={fetchUser}
              >
                Retry
              </button>
            )}
            {error.includes('Session expired') && (
              <button
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={login}
              >
                Login
              </button>
            )}
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-600">Loading user info...</div>
        ) : user ? (
          <>
            <FuelForm 
              onRecordAdded={loadRecords} 
              editRecord={editRecord}
              setEditRecord={setEditRecord}
            />
            <FilterBar 
              records={records}
              onFilterChange={setFilters}
              onSearch={handleSearch}
            />
            <CostAnalysis records={filteredRecords} />
            <Statistics records={filteredRecords} />
            <FuelList 
              records={filteredRecords} 
              onRecordDeleted={loadRecords}
              onEditRecord={setEditRecord}
            />
          </>
        ) : (
          <>
            {authError && (
              <p className="text-center text-red-600 mb-2">Google authentication fail，please try again later</p>
            )}
            <p className="text-center text-gray-700">Please log in to view your fuel records.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;