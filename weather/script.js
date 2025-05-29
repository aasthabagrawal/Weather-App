import stringSimilarity from 'string-similarity';

const noiseWords = new Set([
  'code', 'yellow', 'green', 'alert', 'final', 'update',
  'reg', 'auto', 'automatically', 'initiated', 'report', 'summary', 'test'
]);

const normalizeTitle = (title = '') => {
  return title
    .toLowerCase()
    .replace(/update\s*#?\d+.*$/i, '')
    .replace(/final update.*$/i, '')
    .replace(/\.[a-z]{2,5}\b/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getCoreWords = (title = '') => {
  return new Set(
    normalizeTitle(title)
      .split(/\s+/)
      .filter(word => word.length > 2 && !noiseWords.has(word))
  );
};

const areTitlesEquivalent = (a, b) => {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);

  const sim = stringSimilarity.compareTwoStrings(normA, normB);
  if (sim >= 0.85) return true;

  const coreA = getCoreWords(a);
  const coreB = getCoreWords(b);
  const intersection = [...coreA].filter(w => coreB.has(w));
  const ratio = intersection.length / Math.min(coreA.size, coreB.size);

  return ratio >= 0.7;
};

export const processCodeYellowAlerts = (alerts) => {
  const activeTitles = [];
  const greenClosers = [];

  alerts.forEach((item) => {
    const title = item.reportSummary?.title?.toLowerCase() || "";

    if (title.includes("code yellow")) {
      const base = title.split("-").slice(1).join("-").trim();
      if (!/update|techops.*test/.test(title)) {
        const isDuplicate = activeTitles.some(t => areTitlesEquivalent(t, base));
        if (!isDuplicate) activeTitles.push(base);
      }
    } else if (title.includes("code green")) {
      greenClosers.push(title);
    }
  });

  return { open: activeTitles.length, closed: 0, active: [...activeTitles], greenClosers };
};



export const applyGreenClosures = ({ open, closed, active, greenClosers }) => {
  const activeSet = new Set(active);
  let openCount = open;
  let closedCount = closed;

  greenClosers.forEach((title) => {
    const match = [...activeSet].find(activeTitle =>
      areTitlesEquivalent(activeTitle, title)
    );
    if (match) {
      activeSet.delete(match);
      openCount--;
      closedCount++;
    }
  });

  return { open: openCount, closed: closedCount, active: [...activeSet] };
};









import axios from 'axios';
import stringSimilarity from 'string-similarity';

export const processAlerts = async (data, uuidMap = {}) => {
  let open = 0;
  let closed = 0;
  const activeAlerts = new Set();
  const finalUpdates = [];
  const noiseWords = new Set([
    'high', 'alert', 'final', 'update', 'reg', 'sc',
    'auto', 'automatically', 'initiated', 'cap', 'report', 'summary'
  ]);

  const getCoreWords = (title = '') =>
    new Set(
      title
        .toLowerCase()
        .replace(/update\s*#?\d+.*$/i, '')
        .replace(/final update.*$/i, '')
        .replace(/\.[a-z]{2,5}\b/g, '')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !noiseWords.has(word))
    );

  const normalizeTitle = (title = '') =>
    title
      .toLowerCase()
      .replace(/update\s*#?\d+.*$/i, '')
      .replace(/final update.*$/i, '')
      .replace(/\.[a-z]{2,5}\b/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const areTitlesEquivalent = (a, b) => {
    const sim = stringSimilarity.compareTwoStrings(normalizeTitle(a), normalizeTitle(b));
    if (sim >= 0.85) return true;

    const coreA = getCoreWords(a);
    const coreB = getCoreWords(b);
    const common = [...coreA].filter(word => coreB.has(word));
    const ratio = common.length / Math.min(coreA.size, coreB.size);
    return ratio >= 0.7;
  };

  let alerts = Array.isArray(data) ? data : data?.ResponseStatus?.alerts?.alert || [];

  if (!Array.isArray(alerts)) alerts = [alerts];

  // PASS 1: Identify base/high alerts
  alerts.forEach(alert => {
    const title = alert?.reportSummary?.title || alert?.title || '';
    if (!/high\s*alert/i.test(title)) return;

    const isFinal = /final update/i.test(title);
    const isIntermediate = /update\s*#?\d+/i.test(title) && !isFinal;

    if (!isFinal && !isIntermediate) {
      const matched = [...activeAlerts].some(t => areTitlesEquivalent(t, title));
      if (!matched) {
        activeAlerts.add(title);
        open++;
      }
    }
  });

  // PASS 2: For all active alerts, check /api/report-search to verify "Status: Resolved"
  const verifiedClosed = [];

  for (const title of [...activeAlerts]) {
    const uuid = uuidMap[title];
    if (!uuid) continue;

    try {
      const { data } = await axios.post('http://localhost:4000/api/report-search', { uuid });
      const textContent = data?.notificationReport?.text || '';

      if (/Status:\s*Resolved/i.test(textContent)) {
        verifiedClosed.push(title);
        open--;
        closed++;
      }
    } catch (e) {
      console.warn(`❌ Could not fetch detail for "${title}": ${e.message}`);
    }
  }

  return { open, closed };
};



app.post('/api/report-search', async (req, res) => {
  const { uuid } = req.body;
  const username = 'your_user';
  const password = 'your_pass';

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
    <soapenv:Body>
      <ReportSearch>
        <authorization>
          <user>${username}</user>
          <password>${password}</password>
        </authorization>
        <uuid>${uuid}</uuid>
      </ReportSearch>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(process.env.MIR3_API, xmlBody, {
      headers: { 'Content-Type': 'text/xml', Accept: 'text/xml' },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const responseXml = response.data;
    xml2js.parseString(responseXml, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: 'XML parsing error' });
      
      const status = result?.['soapenv:Envelope']?.['soapenv:Body']?.ReportSearchResponse?.status;
      res.json({ status });
    });
  } catch (error) {
    console.error('ReportSearch failed:', error.message);
    res.status(500).json({ error: 'ReportSearch failed' });
  }
});




app.post('/api/alert-details', async (req, res) => {
  const { uuids } = req.body;

  if (!Array.isArray(uuids) || uuids.length === 0) {
    return res.status(400).json({ error: 'UUIDs are required' });
  }

  const username = 'hfjd';
  const password = 'dsafs';

  try {
    const results = [];

    for (const uuid of uuids) {
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
          <soapenv:Body>
            <ReportSearch>
              <authorization>
                <user>${username}</user>
                <password>${password}</password>
              </authorization>
              <uuid>${uuid}</uuid>
            </ReportSearch>
          </soapenv:Body>
        </soapenv:Envelope>`;

      const response = await axios.post(process.env.MIR3_API, xmlBody, {
        headers: {
          'Content-Type': 'text/xml',
          Accept: 'text/xml',
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

      const detail =
        parsed?.['soapenv:Envelope']?.['soapenv:Body']?.response?.reportSearchResponse;

      if (detail) {
        results.push({ uuid, detail });
      } else {
        console.warn(`No detail for uuid ${uuid}`);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Detail fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch alert details' });
  }
});




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
