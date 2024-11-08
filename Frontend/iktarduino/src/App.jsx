import { useState, useEffect } from 'react';
import IKTHEADER from './Components/IKTHEADER';
import './App.css';
import Graph from './Components/Graph';

function App() {
  const [date, setDate] = useState('');
  const [amount] = useState(1); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newEntry = { dato: date, antall: amount };

    const response = await fetch('http://localhost:3000/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntry),
    });

    if (response.ok) {
      alert('Data added successfully');
    } else {
      alert('Failed to add data');
    }
  };

  const handleButtonClick = () => {
    const currentDate = new Date().toISOString().split('T')[0]; 
    setDate(currentDate);
  };

  useEffect(() => {
    if (date) {
      handleSubmit(new Event('submit')); 
    }
  }, [date]); 

  return (
    <div className="bg-gray-100 min-h-screen">
      <IKTHEADER />
      <div className="container mx-auto p-6">
        <Graph />

        <div className="form-container mt-8 flex flex-col items-center bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add Data</h2>
          <button 
            onClick={handleButtonClick} 
            className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
          >
            Add Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
