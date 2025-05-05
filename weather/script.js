import axios from 'axios';

export const fetchAlerts = async () => {
  try {
    const response = await axios.post('http://localhost:4000/api/status');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch alerts:', error.message);
    return [];
  }
};



const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/status', async (req, res) => {
  const username = 'hfjd';
  const password = 'dsafs';
  const maxResult = 1000;
  let startIndex = 1;
  let allResults = [];
  let moreData = true;

  try {
    while (moreData) {
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
          <soapenv:Body>
            <authorization>
              <user>${username}</user>
              <password>${password}</password>
            </authorization>
            <startIndex>${startIndex}</startIndex>
            <maxResult>${maxResult}</maxResult>
            <query>
              <and>
                <initiatedafter>2025-01-01T00:00:00.000-08:00</initiatedafter>
              </and>
            </query>
          </soapenv:Body>
        </soapenv:Envelope>`;

      const response = await axios.post(process.env.MIR3_API, xmlBody, {
        headers: {
          'Content-Type': 'text/xml',
          'Accept': 'text/xml',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const responseXml = response.data;

      const parsed = await new Promise((resolve, reject) => {
        xml2js.parseString(responseXml, { explicitArray: false }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      const envelope = parsed?.['soapenv:Envelope'];
      const body = envelope?.['soapenv:Body'];
      const responseNode = body?.response?.searchReportsResponse;

      if (!responseNode) {
        console.warn('Unexpected SOAP structure:', parsed);
        break;
      }

      const searchResult = responseNode?.searchResult;
      const matchCount = parseInt(responseNode?.matchCount || '0', 10);

      let currentResults = [];

      if (Array.isArray(searchResult)) {
        currentResults = searchResult;
      } else if (searchResult) {
        currentResults = [searchResult];
      }

      allResults = allResults.concat(currentResults);

      console.log(`Fetched ${allResults.length} of ${matchCount} total`);

      if (startIndex + maxResult > matchCount) {
        moreData = false;
      } else {
        startIndex += maxResult;
      }
    }

    res.json(allResults);
  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});




import React, { useState, useEffect } from 'react';
import { fetchAlerts } from './api/fetchAlerts';
import { processAlerts, processInformationAlerts } from './utils/processAlerts';
import PieChartComponent from './components/PieChartComponent';
import './styles.css';

const App = () => {
  const [dataGroups, setDataGroups] = useState({
    highAlert: { open: 0, closed: 0 },
    codeRed: { open: 0, closed: 0 },
    codeYellow: { open: 0, closed: 0 },
    infoAlert: { open: 0 },
  });

  const getData = async () => {
    const response = await fetchAlerts();
    const alerts = response?.soapenv?.Body?.Response?.searchReportResponse?.searchResult || [];

    if (alerts.length > 0) {
      const highAlert = alerts.filter(a =>
        a?.reportSummary?.title?.toLowerCase().includes('high alert')
      );
      const codeRed = alerts.filter(a =>
        a?.reportSummary?.title?.toLowerCase().includes('code red')
      );
      const codeYellow = alerts.filter(a =>
        a?.reportSummary?.title?.toLowerCase().includes('code yellow')
      );
      const infoAlert = alerts.filter(a =>
        a?.reportSummary?.title?.toLowerCase().includes('information alert')
      );

      setDataGroups({
        highAlert: processAlerts(highAlert),
        codeRed: processAlerts(codeRed),
        codeYellow: processAlerts(codeYellow),
        infoAlert: processInformationAlerts(infoAlert),
      });
    }
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <h1>Alert Dashboard</h1>

      <h2>High Alerts</h2>
      <PieChartComponent
        data={[
          { name: 'Open', value: dataGroups.highAlert.open },
          { name: 'Closed', value: dataGroups.highAlert.closed },
        ]}
      />

      <h2>Code Red</h2>
      <PieChartComponent
        data={[
          { name: 'Open', value: dataGroups.codeRed.open },
          { name: 'Closed', value: dataGroups.codeRed.closed },
        ]}
      />

      <h2>Code Yellow</h2>
      <PieChartComponent
        data={[
          { name: 'Open', value: dataGroups.codeYellow.open },
          { name: 'Closed', value: dataGroups.codeYellow.closed },
        ]}
      />

      <h2>Information Alerts</h2>
      <PieChartComponent
        data={[
          { name: 'Open', value: dataGroups.infoAlert.open },
        ]}
      />
    </div>
  );
};

export default App;





// utils/cleanTitle.js
export const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';

  // Normalize case and remove extra spaces/hyphens
  let title = rawTitle.toLowerCase().replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ').trim();

  // Remove 'final update' or 'update N'
  title = title.replace(/-+\s*final update/i, '');
  title = title.replace(/-+\s*update\s*\d*/i, '');

  // Remove known prefixes (preserving unique part)
  title = title
    .replace(/^(high alert|code yellow|code green|code red|code blue|code orange|information alert|very high)\s*[-:/]*/i, '')
    .trim();

  // Remove multiple dashes
  title = title.replace(/--+/g, '-').trim();

  return title;
};

// utils/processAlerts.js
import { cleanTitle } from './cleanTitle';

export const processAlerts = (alerts) => {
  let open = 0;
  let closed = 0;
  const activeAlerts = new Set();

  if (!alerts || !Array.isArray(alerts)) {
    console.warn("No valid alert data found.");
    return { open, closed };
  }

  alerts.forEach((alertItem) => {
    const rawTitle = alertItem.reportSummary?.title || '';
    const lowerTitle = rawTitle.toLowerCase();

    const baseTitle = cleanTitle(rawTitle);

    const isFinalUpdate = /final update/i.test(rawTitle);
    const isClosureByColor = /code\s*green|code\s*blue/i.test(rawTitle); // May add more colors

    if ((isFinalUpdate || isClosureByColor) && activeAlerts.has(baseTitle)) {
      activeAlerts.delete(baseTitle);
      closed++;
    } else if (!/update\s*\d*/i.test(rawTitle) && !activeAlerts.has(baseTitle)) {
      activeAlerts.add(baseTitle);
      open++;
    }
  });

  return { open, closed };
};




export const processInformationAlerts = (alerts) => {
  let open = 0;

  if (!alerts || !Array.isArray(alerts)) {
    console.warn("No valid info alerts found.");
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
