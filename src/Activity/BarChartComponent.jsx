// BarChartComponent.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

const BarChartComponent = ({ data }) => {
  const lineData = data.map(entry => ({ name: entry.name, value: entry.value }));

  return (
    <div>
      <h3>Graph of Conversation between Me and ChatGPT (Message Count)</h3>
      <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
      
      <h3>Trend Over Time</h3>
      <LineChart width={500} height={300} data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
};

export default BarChartComponent;
