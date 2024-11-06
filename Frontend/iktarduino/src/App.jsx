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
    <>
      <IKTHEADER />
      <Graph />
      
      <div className="form-container">
        <h2 className="text-xl mb-4">Add Data</h2>
        <button 
          onClick={handleButtonClick} 
          className="mt-2 p-2 bg-blue-500 text-white rounded"
        >
          Add Data
        </button>
      </div>
    </>
  );
}

export default App;
