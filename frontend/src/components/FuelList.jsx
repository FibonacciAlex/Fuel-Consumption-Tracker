// src/components/FuelList.jsx
import { useMemo } from 'react';
import { deleteFuelRecord } from '../utils/storage';

function FuelList({ records, onRecordDeleted, onEditRecord }) {
  const recordsWithConsumption = useMemo(() => {
    // Sort and group by license plate
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    const groupedRecords = {};
    sortedRecords.forEach(record => {
      if (!groupedRecords[record.licensePlate]) {
        groupedRecords[record.licensePlate] = [];
      }
      groupedRecords[record.licensePlate].push(record);
    });
    // Calculate consumption and cost per km for full-to-full intervals
    const processedRecords = [];
    Object.values(groupedRecords).forEach(plateRecords => {
      // First, identify all calculation intervals
      const intervals = [];
      
      for (let i = 0; i < plateRecords.length - 1; i++) {
        // Assume first and final record is full tank for calculation convenience
        const isCurrentEffectivelyFull = i === 0 || plateRecords[i].filled || i === (plateRecords.length - 1);
        
        if (isCurrentEffectivelyFull) {
          // Find the next full tank record and accumulate partial fills
          let nextFullIndex = -1;
          let totalAmount = 0;
          let totalPrice = 0;
          
          // Look for the next full tank record
          for (let j = i + 1; j < plateRecords.length; j++) {
            totalAmount += plateRecords[i].amount;
            totalPrice += plateRecords[i].price;
            if (plateRecords[j].filled || j === (plateRecords.length - 1)) {
              nextFullIndex = j;
              break;
            }
            
            
            
          }
          
          // Calculate consumption and cost per km if we found a next full tank
          if (nextFullIndex !== -1) {
            const distance = plateRecords[nextFullIndex].odometer - plateRecords[i].odometer;
            if (distance > 0 && totalAmount > 0) {
              const consumption = ((totalAmount / distance) * 100).toFixed(2);
              const costPerKm = (totalPrice / distance).toFixed(2);
              
              // Store interval data
              intervals.push({
                startIndex: i,
                endIndex: nextFullIndex,
                consumption,
                costPerKm
              });
            }
          }
        }
      }
      
      // Now assign values to records based on intervals
      plateRecords.forEach((record, index) => {
        let consumption = null;
        let costPerKm = null;
        
        // Skip calculation for the last record (it's for future use)
        if (index < plateRecords.length - 1) {
          // Find if this record is part of any interval
          const interval = intervals.find(int => 
            index >= int.startIndex && index < int.endIndex
          );
          
          if (interval) {
            consumption = interval.consumption;
            costPerKm = interval.costPerKm;
          }
        }
        
        processedRecords.push({
          ...record,
          consumption,
          costPerKm
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