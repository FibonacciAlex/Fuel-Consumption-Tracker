// src/components/CostAnalysis.jsx
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CostAnalysis({ records }) {
  const costData = useMemo(() => {
    if (!records.length) return [];

    return records.map((record, index) => {
      const totalDistance = index > 0 && records[index - 1].vehicleId === record.vehicleId
        ? record.odometer - records[index - 1].odometer
        : 0;

      return {
        date: record.date,
        totalCost: parseFloat(record.price),
        costPerKm: totalDistance > 0 
          ? (parseFloat(record.price) / totalDistance).toFixed(2)
          : 0,
      };
    });
  }, [records]);

  const maxCostPerKm = useMemo(() => {
    return Math.max(...costData.map((data) => parseFloat(data.costPerKm) || 0));
  }, [costData]);

  console.log('Cost Data:', costData);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cost Analysis</h2>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" domain={[0, maxCostPerKm]} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalCost"
              stroke="#8884d8"
              name="Total Cost ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="costPerKm"
              stroke="#82ca9d"
              name="Cost per KM ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CostAnalysis;