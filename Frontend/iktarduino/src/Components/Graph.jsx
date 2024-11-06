import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Graph() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/getAll');
        const result = await response.json();
        console.log('Fetched data:', result); 
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error); 
      }
    };

    fetchData();
  }, []);


  const chartData = {
    labels: data.map(item => item.dato), 
    datasets: [
      {
        label: 'Amount',
        data: data.map(item => item.antall), 
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1
      }
    ]
  };

  return (
    <div className="flex flex-col items-center justify-center h-16">
      <h1 className="text-3xl text-black">Graph</h1>
      <div style={{ width: '80%', height: '400px' }}>
        <Line data={chartData} />
      </div>
    </div>
  );
}
