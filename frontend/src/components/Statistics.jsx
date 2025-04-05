// src/components/Statistics.jsx
import { useMemo } from 'react';

function Statistics({ records }) {
  const statistics = useMemo(() => {
    const vehicleStats = {};
    debugger
    // Group records by license plate
    records.forEach(record => {
      if (!vehicleStats[record.licenseplate]) {
        vehicleStats[record.licenseplate] = {
          totalConsumption: 0,
          totalDistance: 0,
          totalFuel: 0,
          totalCost: 0,
          records: []
        };
      }
      vehicleStats[record.licenseplate].records.push(record);
    });

    // Calculate statistics for each vehicle
    Object.keys(vehicleStats).forEach(plate => {
      const sortedRecords = vehicleStats[plate].records.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      let totalFuel = 0;
      let totalDistance = 0;
      let totalCost = 0;

      for (let i = 1; i < sortedRecords.length; i++) {
        const distance = sortedRecords[i].odometer - sortedRecords[i-1].odometer;
        totalDistance += distance;
        totalFuel += parseFloat(sortedRecords[i].amount);
        totalCost += parseFloat(sortedRecords[i].price);
      }

      vehicleStats[plate].averageConsumption = totalDistance > 0 
        ? ((totalFuel / totalDistance) * 100).toFixed(2)
        : null;
      vehicleStats[plate].averageCostPerKm = totalDistance > 0
        ? (totalCost / totalDistance).toFixed(2)
        : null;
      vehicleStats[plate].totalDistance = totalDistance;
      vehicleStats[plate].totalFuel = totalFuel;
      vehicleStats[plate].totalCost = totalCost;
    });

    return vehicleStats;
  }, [records]);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Vehicle Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(statistics).map(([plate, stats]) => (
          <div key={plate} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{plate}</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Average Consumption: {stats.averageConsumption ? `${stats.averageConsumption} L/100km` : 'N/A'}
              </p>
              <p className="text-gray-600">
                Average Cost: {stats.averageCostPerKm ? `$${stats.averageCostPerKm}/km` : 'N/A'}
              </p>
              <p className="text-gray-600">
                Total Distance: {stats.totalDistance.toFixed(1)} km
              </p>
              <p className="text-gray-600">
                Total Fuel: {stats.totalFuel.toFixed(1)} L
              </p>
              <p className="text-gray-600">
                Total Cost: $ {stats.totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;