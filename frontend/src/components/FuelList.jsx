// src/components/FuelList.jsx
import { useMemo } from 'react';
import { deleteFuelRecord } from '../utils/storage';

function FuelList({ records, onRecordDeleted, onEditRecord }) {
  const recordsWithConsumption = useMemo(() => {
    const sortedRecords = records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by license plate
    const groupedRecords = {};
    sortedRecords.forEach(record => {
      if (!groupedRecords[record.licensePlate]) {
        groupedRecords[record.licensePlate] = [];
      }
      groupedRecords[record.licensePlate].push(record);
    });

    // Calculate consumption for each group
    const processedRecords = [];
    Object.values(groupedRecords).forEach(plateRecords => {
      plateRecords.forEach((record, index) => {
        if (index === 0) {
          processedRecords.push({ ...record, consumption: null, costPerKm: null });
          return;
        }
        
        const prevRecord = plateRecords[index - 1];
        const distance = record.odometer - prevRecord.odometer;
        const consumption = (record.amount / distance) * 100; // L/100km
        const costPerKm = record.price / distance; // $/km
        
        processedRecords.push({
          ...record,
          consumption: consumption.toFixed(2),
          costPerKm: costPerKm.toFixed(2)
        });
      });
    });

    return processedRecords;
  }, [records]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteFuelRecord(id);
      onRecordDeleted();
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No fuel records found with current filters.
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (L)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price ($)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer (km)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption (L/100km)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/km ($)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Tank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {recordsWithConsumption.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap">{record.licensePlate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(record.date).toLocaleDateString('en-CA')} {/* Format date as YYYY-MM-DD in local time */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{record.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">{record.price}</td>
              <td className="px-6 py-4 whitespace-nowrap">{record.odometer}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.consumption ? record.consumption : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.costPerKm ? record.costPerKm : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.filled ? 'Yes' : 'No'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onEditRecord(record)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FuelList;