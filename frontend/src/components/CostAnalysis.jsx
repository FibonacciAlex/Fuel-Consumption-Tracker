// src/components/CostAnalysis.jsx
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CostAnalysis({ records }) {
  const [timeFrame, setTimeFrame] = useState('month'); // 'month' or 'year'

  const costData = useMemo(() => {
    if (!records.length) return [];

    const data = new Map();
    
    records.forEach(record => {
      const date = new Date(record.date);
      const key = timeFrame === 'month' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;

      if (!data.has(key)) {
        data.set(key, { 
          date: key,
          totalCost: 0,
          totalFuel: 0,
          totalDistance: 0
        });
      }

      const current = data.get(key);
      current.totalCost += parseFloat(record.price);
      current.totalFuel += parseFloat(record.amount);
      
      // Calculate distance only if there's a previous record for the same vehicle
      const prevRecord = records
        .filter(r => r.licensePlate === record.licensePlate && new Date(r.date) < date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      
      if (prevRecord) {
        current.totalDistance += record.odometer - prevRecord.odometer;
      }
    });

    return Array.from(data.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        costPerKm: item.totalDistance > 0 
          ? (item.totalCost / item.totalDistance).toFixed(2)
          : 0
      }));
  }, [records, timeFrame]);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cost Analysis</h2>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
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