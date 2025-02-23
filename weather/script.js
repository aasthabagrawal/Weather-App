// First, modify the addSymbolFilter function to add an ID to the dropdown container
function addSymbolFilter() {
  const table = document.querySelector('#csv_display table');
  if (!table) return;

  symbolColumnIndex = Array.from(table.querySelectorAll('th')).findIndex(
    th => th.textContent.trim().toLowerCase() === 'ipo symbol'
  );
  if (symbolColumnIndex === -1) return;

  const filterButton = createFilterButton();
  const dropdownContainer = createDropdownContainer();
  dropdownContainer.id = 'symbol-dropdown-container'; // Add this line

  const searchInput = createSearchInput();
  dropdownContainer.appendChild(searchInput);

  const uniqueSymbols = new Set();
  Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
    const symbolCell = row.cells[symbolColumnIndex];
    if (symbolCell) uniqueSymbols.add(symbolCell.textContent.trim());
  });

  uniqueSymbols.forEach(symbol => {
    const option = createCheckboxOption(symbol, () => {
      toggleSymbolFilter(symbol);
      moveCheckedSymbolsToTop(); // Add this line
    });
    dropdownContainer.appendChild(option);
  });

  attachDropdownToHeader(table, symbolColumnIndex, filterButton, dropdownContainer);
  filterCheckboxOptionsBySearch(searchInput, dropdownContainer);
}

// Add the function to move checked symbols to top
function moveCheckedSymbolsToTop() {
  const container = document.getElementById('symbol-dropdown-container');
  if (!container) return;

  // Skip the search input which is the first child
  const searchInput = container.firstChild;
  
  // Get all checkbox options except the search input
  const options = Array.from(container.children).slice(1);
  
  // Separate into checked and unchecked arrays
  const checked = [];
  const unchecked = [];
  
  options.forEach(option => {
    const checkbox = option.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      checked.push(option);
    } else {
      unchecked.push(option);
    }
  });

  // Clear the container (except search input)
  while (container.children.length > 1) {
    container.removeChild(container.lastChild);
  }

  // Add back in the desired order
  checked.forEach(option => container.appendChild(option));
  unchecked.forEach(option => container.appendChild(option));
}

// Modify the createCheckboxOption function to add a class for easier selection
function createCheckboxOption(text, clickHandler) {
  const container = document.createElement('div');
  container.className = 'dropdown-option';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.marginRight = '5px';
  
  const label = document.createElement('span');
  label.textContent = text;
  
  container.onclick = (event) => {
    // Only toggle if clicking the container or label (not the checkbox directly)
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      clickHandler();
    }
  };
  
  checkbox.onclick = (event) => {
    event.stopPropagation();
    clickHandler();
  };
  
  container.appendChild(checkbox);
  container.appendChild(label);
  return container;
}







table {
      width: 100%;
      border-collapse: collapse;
      background-color: pink;
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


    body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  background-color: #333;
  color: white;
  padding: 15px;
}

.initial_container {
  text-align: center;
  margin-top: 20px;
}

.initial_button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.initial_button:hover {
  background-color: #45a049;
}

.csv_table_container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-top: 20px;
  padding-bottom: 40px;  /* Account for the fixed bottom element */
}

.total-records {
  position: fixed;
  bottom: 0px;
  left: 10px; /* Aligns to the bottom-left */
  padding: 10px;
  font-weight: bold;
  z-index: 1000; /* Ensures it stays above other elements */
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
