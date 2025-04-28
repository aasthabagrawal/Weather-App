/  Another Pie Chart component just below

export const InformationPieChartComponent = ({ data, title }) => {
  const pieData = [
    { name: 'Information Alerts Open', value: data.open || 0 },
  ];

  return (
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h2>{title}</h2> {/* Title for second pie chart */}
      <PieChart width={400} height={300}>
        <Pie
          data={pieData}
          cx={200}
          cy={150}
          innerRadius={50}
          outerRadius={100}
          fill="#00C49F"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`Cell-Info-${index}`} fill="#00C49F" />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;











// New function for Information Alerts
export const processInformationAlerts = (alerts) => {
  let open = 0;

  if (!alerts || !Array.isArray(alerts)) {
    console.warn("No valid alert data found for Information Alerts.");
    return { open };
  }

  alerts.forEach((alertItem) => {
    const title = alertItem.reportSummary?.title || '';

    if (title.toLowerCase().includes('information alert')) {
      open++;
    }
  });

  return { open };
};














return (
  <div className="app-container">
    <h1>Alert Status Dashboard</h1>
    <div className="charts-container">
      <div className="chart-box">
        <h2>Alert Status</h2>
        <PieChartComponent 
          data={[
            { name: 'Open', value: alertData.open },
            { name: 'Closed', value: alertData.closed }
          ]}
        />
      </div>
      {/* Add more chart-box divs here for your other pie charts */}
    </div>
  </div>
);



.app-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Change from center to flex-start to align left */
  margin: 30px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

/* Add this for your charts layout */
.charts-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 20px;
}

/* Style for individual chart containers */
.chart-box {
  flex: 1 1 calc(50% - 20px); /* For 2x2 grid layout */
  min-width: 300px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}











import axios from 'axios';

export const fetchAlerts = async () => {
  try {
    const response = await axios.post('http://localhost:4000/api/status', {
      username: 'yourUsername',
      password: 'yourPassword',
      uuid: 'yourUUID',
    });

    const data = response.data;
    console.log("Full fetched data:", JSON.stringify(data, null, 2));

    const envelope = data['soapenv:Envelope'];    // first level
    if (!envelope) {
      console.error("Envelope not found!");
      return null;
    }

    const body = envelope['soapenv:Body'];         // second level
    if (!body) {
      console.error("Body not found!");
      return null;
    }

    const responseObj = body['response'];           // third level
    if (!responseObj) {
      console.error("Response not found!");
      return null;
    }

    const searchReport = responseObj['searchReportResponse'];  // fourth level
    if (!searchReport) {
      console.error("searchReportResponse not found!");
      return null;
    }

    const searchResult = searchReport['searchResult'];          // final level
    if (!searchResult) {
      console.error("searchResult not found!");
      return null;
    }

    console.log("Extracted searchResult:", searchResult);

    return searchResult;   // ✅ return the list of alerts
  } catch (error) {
    console.error('Error fetching alerts:', error.message || error);
    return null;
  }
};




export const processAlerts = (alerts) => {
  let open = 0;
  let closed = 0;
  const activeAlerts = new Set();

  if (!alerts || !Array.isArray(alerts)) {
    console.warn("No valid alert data found.");
    return { open, closed };
  }

  alerts.forEach((alertItem) => {
    const title = alertItem.reportSummary?.title || '';

    const baseTitle = title.toLowerCase().replace(/ - final update$/, '').replace(/ - update\d*$/, '').trim();

    if (title.toLowerCase().includes('final update')) {
      if (activeAlerts.has(baseTitle)) {
        activeAlerts.delete(baseTitle);
        closed++;
      }
    } else if (!title.toLowerCase().includes('update') && !activeAlerts.has(baseTitle)) {
      activeAlerts.add(baseTitle);
      open++;
    }
  });

  return { open, closed };
};




.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}


fetchALrt.js
import axios from 'axios';

export const fetchAlerts = async () => {
  try {
    const response = await axios.post('http://localhost:4000/api/status', {
      username: 'yourUsername',   // Replace with your username
      password: 'yourPassword',   // Replace with your password
      uuid: 'yourUUID',            // This will be passed differently later if needed
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return null;
  }
};

processalert
export const processAlerts = (data) => {
  let open = 0;
  let closed = 0;
  const activeAlerts = new Set();

  if (!data || !data.ResponseStatus || !data.ResponseStatus.alerts) {
    console.warn("No valid alert data found.");
    return { open, closed };
  }

  const alerts = Array.isArray(data.ResponseStatus.alerts.alert)
    ? data.ResponseStatus.alerts.alert
    : [data.ResponseStatus.alerts.alert];

  alerts.forEach((alert) => {
    const title = alert.title || '';

    const baseTitle = title.toLowerCase().replace(/ - final update$/, '').replace(/ - update\d*$/, '').trim();

    // Check if it's a "final update" and close the alert
    if (title.toLowerCase().includes('final update')) {
      if (activeAlerts.has(baseTitle)) {
        activeAlerts.delete(baseTitle);
        closed++;
      }
    }
    // Only open a new alert if it's not an update
    else if (!title.toLowerCase().includes('update') && !activeAlerts.has(baseTitle)) {
      activeAlerts.add(baseTitle);
      open++;
    }
  });

  return { open, closed };
};


piechartalert.js

import React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#FF0000', '#FFD700']; // Red for Open, Yellow for Closed

const PieChartComponent = ({ data }) => {
  const chartData = [
    { name: 'Open', value: data.open },
    { name: 'Closed', value: data.closed },
  ];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={150}
        fill="#8884d8"
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Legend />
    </PieChart>
  );
};

export default PieChartComponent;

App.js
import React, { useState, useEffect } from 'react';
import { fetchAlerts } from './api/fetchAlerts';
import { processAlerts } from './utils/processAlerts';
import PieChartComponent from './components/PieChartComponent';
import './styles.css';

const App = () => {
  const [alertData, setAlertData] = useState({ open: 0, closed: 0 });

  const getData = async () => {
    const rawData = await fetchAlerts();
    if (rawData) {
      const processed = processAlerts(rawData);
      setAlertData(processed);
    }
  };

  useEffect(() => {
    getData();  // initial fetch
    const interval = setInterval(() => {
      getData();  // fetch every 10 seconds
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="app-container">
      <h1>Alert Status Dashboard</h1>
      <PieChartComponent data={alertData} />
    </div>
  );
};

export default App;

const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': 'd53a30c2d1msh3800f22f8aeb495p1bf04djsn7ac813f8b66f',
        'x-rapidapi-host': 'weather-by-api-ninjas.p.rapidapi.com'
    }
};

const fetchWeather = async (city) => {
    const url = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=${city}`;
    try {
        cityName.innerHTML = city;
        const response = await fetch(url, options);
        const result = await response.json(); // Parse the response as JSON
        console.log(result);

        // Assuming you have elements with the following IDs in your HTML
        document.getElementById('cloud_pct').innerHTML = result.cloud_pct;
        document.getElementById('temp').innerHTML = result.temp;
        document.getElementById('temp2').innerHTML = result.temp;
        document.getElementById('feels_like').innerHTML = result.feels_like;
        document.getElementById('humidity').innerHTML = result.humidity;
        document.getElementById('humidity2').innerHTML = result.humidity;
        document.getElementById('min_temp').innerHTML = result.min_temp;
        document.getElementById('max_temp').innerHTML = result.max_temp;
        document.getElementById('wind_speed').innerHTML = result.wind_speed;
        document.getElementById('wind_speed2').innerHTML = result.wind_speed;
        document.getElementById('wind_degrees').innerHTML = result.wind_degrees;
        document.getElementById('sunrise').innerHTML = result.sunrise;
        document.getElementById('sunset').innerHTML = result.sunset;
    } catch (error) {
        console.error(error);
    }
};

// Initial fetch for default city

// Add event listener for the form submission
submit.addEventListener("click", (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    fetchWeather(city);
});

fetchWeather('Delhi');

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Page</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='scripts.css') }}">  
  
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f4f4f4;
      font-weight: bold;
    }


    
  .csv_table_container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-top: 20px;
}

.total-records {
  position: fixed;
  bottom: 0px;
  left: 10px; /* Aligns to the bottom-left */
  padding: 10px;
  font-weight: bold;
  text-align: left;
  z-index: 1000; /* Ensures it stays above other elements */
}

  </style>

  <script>
    let totalRecords = 0;
    

    function fetchCSV(fileType) {
      // Fetch all data without pagination
      fetch(`/get_csv?file=${fileType}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            document.getElementById('csv_display').innerHTML = `<p style='color:red;'>${data.error}</p>`;
          } else {
            displayTable(data);
          }
        })
        .catch(error => {
          document.getElementById('csv_display').innerHTML = `<p style='color:red;'>Error: ${error.message}</p>`;
        });
    }

let tableData = []; // Store full dataset
let recordsPerLoad = 100; // Load 20 records at a time
let currentLoaded = 0; // Tracks the number of records loaded

function displayTable(data) {
    if (!data.length) {
        document.getElementById('csv_display').innerHTML = '<p>No data available.</p>';
        return;
    }

    tableData = data; // Store data globally
    currentLoaded = 0; // Reset load counter
    document.getElementById('csv_display').innerHTML = ''; // Clear previous content

    let table = document.createElement('table');
    table.id = 'data_table';
    table.classList.add('table', 'table-striped');

    // Create table header
    let header = `<thead><tr>${Object.keys(tableData[0]).map(key => `<th>${key}</th>`).join('')}</tr></thead>`;
    table.innerHTML = header;

    let tbody = document.createElement('tbody');
    tbody.id = 'table_body';

    table.appendChild(tbody);
    document.getElementById('csv_display').appendChild(table);

    loadMoreRecords(); // Load initial records

    // Attach scroll event for infinite scrolling
    document.getElementById('csv_display').addEventListener('scroll', handleScroll);

    // Display the total number of records at the bottom
    totalRecords = data.length;
    document.getElementById('csv_display').innerHTML += `<div class="total-records">Total Records: ${totalRecords}</div>`;
}

function loadMoreRecords() {
    let tbody = document.getElementById('table_body');

    let end = Math.min(currentLoaded + recordsPerLoad, tableData.length);
    let newRecords = tableData.slice(currentLoaded, end);

    newRecords.forEach(row => {
        let tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            let td = document.createElement('td');
            td.textContent = value !== null ? value : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    currentLoaded = end; // Update records loaded count

    // Remove event listener when all data is loaded
    if (currentLoaded >= tableData.length) {
        document.getElementById('csv_display').removeEventListener('scroll', handleScroll);
    }

}

function handleScroll() {
    let container = document.getElementById('csv_display');

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        loadMoreRecords(); // Load more records when user reaches bottom
    }
}


  </script>
</head>

<body>
  <div class="header">TERMINAL APP</div>

  <div class="initial_container">
    <button onclick="fetchCSV('input')" class="initial_button">Input File</button>
    <button onclick="fetchCSV('output')" class="initial_button">Output File</button>
  </div>
  
  <div id="csv_display" class="csv_table_container">
    <!-- Table content will be inserted here -->
  </div>  
  
  
  <div id="total_records" class="total-records">
    <!-- Total records will be displayed here -->
  </div>
</body>
</html>
