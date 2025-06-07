// FuelForm.jsx
import { useState, useEffect } from 'react';
import { saveFuelRecord, updateFuelRecord } from '../utils/storage';

function FuelForm({ onRecordAdded, editRecord, setEditRecord }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    licensePlate: '',
    amount: '',
    price: '',
    odometer: '',
    isFull: false // Added isFull property
  });

  useEffect(() => {
    if (editRecord) {
      // Format the date to YYYY-MM-DD for date input
      const formattedDate = new Date(editRecord.date).toLocaleDateString('en-CA').split('T')[0];// change to YYYY-MM-DD, local time
      setFormData({//Overwriting Properties: licensePlate
        ...editRecord,
        date: formattedDate,
        isFull: editRecord.isFull || false // Ensure isFull is set
      });
    }
  }, [editRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Map isFull to boolean and ensure all fields are correct
    const recordToSend = {
      ...formData,
      isFull: formData.isFull === true || formData.isFull === 'true',
      amount: parseFloat(formData.amount),
      price: parseFloat(formData.price),
      odometer: parseFloat(formData.odometer),
    };
    if (editRecord) {
      await updateFuelRecord({ ...recordToSend, id: editRecord.id });
      setEditRecord(null);
    } else {
      await saveFuelRecord(recordToSend);
    }
    await onRecordAdded(); // Trigger a reload of records after submission
    setFormData({
      date: new Date().toISOString().split('T')[0],
      licensePlate: '',
      amount: '',
      price: '',
      odometer: '',
      isFull: false // Reset isFull to default
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {editRecord ? 'Edit Fuel Record' : 'Add Fuel Record'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700">License Plate</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Fuel Amount (L)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Odometer (km)</label>
          <input
            type="number"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Is Tank Full?</label>
          <div className="mt-1 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="isFull"
                value="true"
                checked={formData.isFull === true}
                onChange={() => setFormData(prev => ({ ...prev, isFull: true }))}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isFull"
                value="false"
                checked={formData.isFull === false}
                onChange={() => setFormData(prev => ({ ...prev, isFull: false }))}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="mt-4 flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          {editRecord ? 'Update Record' : 'Add Record'}
        </button>
        {editRecord && (
          <button
            type="button"
            onClick={() => setEditRecord(null)}
            className="mt-4 flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default FuelForm;