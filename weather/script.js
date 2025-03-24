
let socket; // Declare the socket outside for reuse
let inputBuffer = ""; // Buffer for user input
let inputHandler; // Reference for the terminal's input handler
let inputHandlerDisposable;

function setupWebSocket(route) {
  // Close any existing WebSocket connection
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    socket.close();
  }

  // Reset the terminal
  term.reset();
  inputBuffer = "";

  term.write("Connecting to backend...\r\n");

  try {
    // Establish a new WebSocket connection with explicit protocols
    socket = new WebSocket(`ws://${location.host}/${route}`);

    socket.onopen = () => {
      term.write(
        "Connection established. Please enter your details below:\r\n"
      );

      // Remove the previous input handler, if any
      if (inputHandlerDisposable) {
        // If your terminal library uses a different method, adjust this
        inputHandlerDisposable.dispose();
      }

      // Define the input handler
      inputHandler = (data) => {
        if (data === "\u0004") {
          // Ctrl+D pressed
          term.write("\r\nTerminating session...\r\n");

          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close(1000, "User terminated session with Ctrl+D"); // 1000 = Normal Closure
          }

          // Optionally dispose of input handler
          if (inputHandlerDisposable) {
            inputHandlerDisposable.dispose();
          }

          return; // Skip processing further
        }
        if (data === "\r") {
          try {
            // Explicitly send as text
            socket.send(inputBuffer);
          } catch (e) {
            term.write(`\r\nError sending data: ${e.message}\r\n`);
          }
          inputBuffer = "";
          term.write("\r\n");
        } else if (data === "\u007F") {
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            term.write("\b \b");
          }
        } else {
          inputBuffer += data;
          term.write(data);
        }
      };

      // Store the input handler - adapt this based on your terminal library
      inputHandlerDisposable = term.onData(inputHandler);
    };

    socket.onmessage = (event) => {
      try {
        term.write(event.data);
      } catch (e) {
        term.write(`\r\nError displaying message: ${e.message}\r\n`);
      }
    };

    socket.onclose = () => term.write("\r\nConnection closed. Code: \r\n");

    socket.onerror = (error) => {
      term.write(`\r\nWebSocket Error: ${JSON.stringify(error)}\r\n`);
    };
  } catch (error) {
    term.write(`\r\nFailed to connect: ${error.message}\r\n`);
  }
}






















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
