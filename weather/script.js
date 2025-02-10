let currentFile = "";
    let activeSymbolFilters = new Set();
    let activeDateFilters = new Set();
    let symbolColumnIndex = -1;
    let dateColumnIndex = -1;

    function fetchCSV(type) {
      currentFile = type;
      updateTable();
    }

    function updateTable() {
      if (!currentFile) return;

      fetch(`/get_csv?file=${currentFile}`)
        .then(response => response.text())
        .then(data => {
          let displayDiv = document.getElementById('csv_display');
          displayDiv.innerHTML = data;
          displayDiv.style.display = "block";


          const table = displayDiv.querySelector("table");
      if (table) {
        table.setAttribute("id", "ipoTable");
        // Auto-sort by IPO Date if the file is output
        if (currentFile === 'output') {
          addSymbolFilter();
          addDateFilter();
        }
        autoSortByDate("ipoTable"); // Always sort by date
      }
    })
    .catch(error => {
      document.getElementById('csv_display').innerHTML = `<p style="color:red;">Error loading data: ${error}</p>`;
    });
}

function autoSortByDate(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.rows).slice(1); // Skip the header row
  const dateColumnIndex = findDateColumnIndex(table);

  if (dateColumnIndex === -1) return;

  rows.sort((a, b) => {
    const dateA = new Date(a.cells[dateColumnIndex].innerText.trim());
    const dateB = new Date(b.cells[dateColumnIndex].innerText.trim());
    return dateB - dateA; // Descending order
  });

  rows.forEach(row => table.appendChild(row)); // Append sorted rows
}

function findDateColumnIndex(table) {
  const headerCells = table.rows[0].cells;
  for (let i = 0; i < headerCells.length; i++) {
    if (headerCells[i].innerText.toLowerCase().includes('ipo date')) {
      return i;
    }
  }
  return -1;
}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Page</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='scripts.css') }}">

  <style>
    ul.tree-view {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    ul.tree-view li {
      margin-left: 20px;
      position: relative;
    }

    ul.tree-view li label {
      cursor: pointer;
    }

    ul.tree-view li ul {
      display: none;
      list-style: none;
      padding-left: 15px;
    }

    ul.tree-view li.expanded > ul {
      display: block;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 5px;
    }
  </style>

  <script>
    let currentFile = "";
    let activeSymbolFilters = new Set();
    let activeDateFilters = new Set();
    let symbolColumnIndex = -1;
    let dateColumnIndex = -1;

    function fetchCSV(type) {
      currentFile = type;
      updateTable();
    }

    function updateTable() {
      if (!currentFile) return;

      fetch(`/get_csv?file=${currentFile}`)
        .then(response => response.text())
        .then(data => {
          let displayDiv = document.getElementById('csv_display');
          displayDiv.innerHTML = data;
          displayDiv.style.display = "block";
          if (currentFile === 'output') {
            addSymbolFilter();
            addDateFilter();
          }
        })
        .catch(error => {
          document.getElementById('csv_display').innerHTML = `<p style="color:red;">Error loading data: ${error}</p>`;
        });
    }

    function resetFilters() {
  // Clear all active filters
  activeDateFilters.clear();
  activeSymbolFilters.clear();

  // Reset all checkboxes in the filter dropdown
  const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Reset the table to show all rows
  const tableRows = document.querySelectorAll('#csv_display table tbody tr');
  tableRows.forEach(row => {
    row.style.display = '';
  });
}

function handleFileOutputLoad() {
  resetFilters(); // Reset filters when loading a new file
  // Add other logic if needed for file loading...
}

function addSymbolFilter() {
  const table = document.querySelector('#csv_display table');
  if (!table) return;

  symbolColumnIndex = Array.from(table.querySelectorAll('th')).findIndex(
    th => th.textContent.trim().toLowerCase() === 'symbol'
  );
  if (symbolColumnIndex === -1) return;

  const filterButton = createFilterButton();
  const dropdownContainer = createDropdownContainer();
  const searchInput = createSearchInput();

  dropdownContainer.appendChild(searchInput);

  const uniqueSymbols = new Set();
  Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
    const symbolCell = row.cells[symbolColumnIndex];
    if (symbolCell) uniqueSymbols.add(symbolCell.textContent.trim());
  });

  uniqueSymbols.forEach(symbol => {
    const option = createCheckboxOption(symbol, () => toggleSymbolFilter(symbol));
    dropdownContainer.appendChild(option);
  });

  attachDropdownToHeader(table, symbolColumnIndex, filterButton, dropdownContainer);
  filterCheckboxOptionsBySearch(searchInput, dropdownContainer);
}

    function addDateFilter() {
  const table = document.querySelector('#csv_display table');
  if (!table) return;

  dateColumnIndex = Array.from(table.querySelectorAll('th')).findIndex(
    (th) => th.textContent.trim().toLowerCase() === 'ipo date'
  );
  if (dateColumnIndex === -1) return;

  const filterButton = createFilterButton();
  const dropdownContainer = createDropdownContainer();
  const searchInput = createSearchInput();

  dropdownContainer.appendChild(searchInput);

  const yearMonthMap = new Map();

  Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
    const cell = row.cells[dateColumnIndex];
    if (cell) {
      const dateParts = cell.textContent.trim().split('/');
      if (dateParts.length === 3) {
        const [month, , year] = dateParts;
        const monthName = getMonthName(parseInt(month));
        if (!yearMonthMap.has(year)) yearMonthMap.set(year, new Set());
        yearMonthMap.get(year).add(monthName);
      }
    }
  });

  dropdownContainer.appendChild(createTreeView(yearMonthMap));

  attachDropdownToHeader(table, dateColumnIndex, filterButton, dropdownContainer);
  filterCheckboxOptionsBySearch(searchInput, dropdownContainer);
}

function getMonthName(monthNumber) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 
    'June', 'July', 'August', 'September', 'October', 
    'November', 'December'
  ];
  return monthNames[monthNumber - 1]; // Subtract 1 since monthNumber is 1-based
}

function populateMonthList(year, yearMonthMap, monthList) {
  monthList.innerHTML = ''; // Clear previous months
  const months = yearMonthMap.get(year) || [];

  months.forEach((monthName) => {
    const monthNode = document.createElement('li');
    monthNode.innerHTML = `
      <label class="checkbox-label">
        <input type="checkbox" onchange="toggleDateFilter('${monthName}/${year}')">
        ${monthName}
      </label>
    `;
    monthList.appendChild(monthNode);
  });
}

function createTreeView(yearMonthMap, dropdownContainer) {
  const treeView = document.createElement('ul');
  treeView.className = 'tree-view';

  yearMonthMap.forEach((months, year) => {
    const yearNode = createTreeNode(year, true, yearMonthMap, dropdownContainer);
    treeView.appendChild(yearNode);
  });

  return treeView;
}


function createTreeNode(text, isYear = false, yearMonthMap = new Map()) {
  const li = document.createElement('li');
  li.innerHTML = `
    <label class="checkbox-label">
      <input type="checkbox" onchange="toggleDateFilter('${text}')">
      ${text}
    </label>
    <ul class="month-list"></ul>
  `;

  const monthList = li.querySelector('.month-list');
  const label = li.querySelector('label');

  label.addEventListener('click', (event) => {
    if (event.target.tagName === 'INPUT') return; // Skip if clicking directly on the checkbox

    if (isYear) {
      li.classList.toggle('expanded');

      // Show month list for the selected year
      if (li.classList.contains('expanded')) {
        populateMonthList(text, yearMonthMap, monthList);
      } else {
        monthList.innerHTML = ''; // Clear month list on collapse
      }
    }
  });

  return li;
}

function populateMonthList(year, yearMonthMap, monthList) {
  monthList.innerHTML = ''; // Clear previous months
  const months = yearMonthMap.get(year) || [];

  months.forEach(month => {
    const monthNode = document.createElement('li');
    monthNode.innerHTML = `
      <label class="checkbox-label">
        <input type="checkbox" onchange="toggleDateFilter('${month}/${year}')">
        ${month}
      </label>
    `;
    monthList.appendChild(monthNode);
  });
}




function toggleYearFilter(year) {
  if (activeDateFilters.has(year)) {
    activeDateFilters.delete(year);
  } else {
    activeDateFilters.add(year);
  }
  filterTable();
}

function toggleMonthFilter(year, month) {
  const monthKey = `${year}/${month}`;
  if (activeDateFilters.has(monthKey)) {
    activeDateFilters.delete(monthKey);
  } else {
    activeDateFilters.add(monthKey);
  }
  filterTable();
}


function toggleYearFilter(selectedYear, yearMonthMap, dropdownContainer) {
  if (activeDateFilters.has(selectedYear)) {
    activeDateFilters.delete(selectedYear);
    removeMonthDropdown(dropdownContainer);
  } else {
    activeDateFilters.clear(); // Only one year active at a time
    activeDateFilters.add(selectedYear);
    createMonthDropdown(selectedYear, yearMonthMap, dropdownContainer);
  }
  filterTable();
}

function createMonthDropdown(selectedYear, yearMonthMap, dropdownContainer) {
  removeMonthDropdown(dropdownContainer); // Clear previous month dropdown

  const monthContainer = document.createElement('div');
  monthContainer.className = 'month-filter-container';
  monthContainer.style.marginTop = '10px';
  monthContainer.textContent = `Filter by month for ${selectedYear}:`;

  const monthDropdown = document.createElement('div');
  monthDropdown.style.padding = '5px';

  const months = Array.from(yearMonthMap.get(selectedYear) || []);
  months.forEach(month => {
    const option = createCheckboxOption(`Month: ${month}`, () => toggleMonthFilter(month));
    monthDropdown.appendChild(option);
  });

  monthContainer.appendChild(monthDropdown);
  dropdownContainer.appendChild(monthContainer);
}

function removeMonthDropdown(dropdownContainer) {
  const monthContainer = dropdownContainer.querySelector('.month-filter-container');
  if (monthContainer) monthContainer.remove();
}

function toggleMonthFilter(selectedMonth) {
  const monthKey = `Month: ${selectedMonth}`;
  if (activeDateFilters.has(monthKey)) {
    activeDateFilters.delete(monthKey);
  } else {
    activeDateFilters.add(monthKey);
  }
  filterTable();
}


function toggleSymbolFilter(selectedValue) {
  if (activeSymbolFilters.has(selectedValue)) {
    activeSymbolFilters.delete(selectedValue);
  } else {
    activeSymbolFilters.add(selectedValue);
  }
  filterTable();
}


    function toggleDateFilter(selectedValue) {
  if (activeDateFilters.has(selectedValue)) {
    activeDateFilters.delete(selectedValue);
  } else {
    activeDateFilters.add(selectedValue);

    // Automatically deselect the year when selecting a specific month
    if (selectedValue.includes('/')) {
      const [, year] = selectedValue.split('/');
      activeDateFilters.delete(year);
    } else {
      // Deselect month filters when selecting a year
      Array.from(activeDateFilters).forEach(filter => {
        if (filter.includes(`${selectedValue}/`)) {
          activeDateFilters.delete(filter);
        }
      });
    }
  }
  filterTable();
}

function filterTable() {
  const table = document.querySelector('#csv_display table');
  if (!table) return;

  Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
    const dateCell = row.cells[dateColumnIndex];
    const symbolCell = row.cells[symbolColumnIndex];
    if (!dateCell || !symbolCell) return;

    const cellDateParts = dateCell.textContent.trim().split('/');
    if (cellDateParts.length !== 3) return;

    const [month, , year] = cellDateParts;
    const monthName = getMonthName(parseInt(month));

    let showRow = true;

    // Apply Date Filters
    if (activeDateFilters.size > 0) {
      showRow = false; // Hide by default

      activeDateFilters.forEach((filter) => {
        const [filterMonthName, filterYear] = filter.split('/');

        if (filterMonthName && filterYear) {
          // Handle month and year filter
          if (monthName === filterMonthName && year === filterYear) {
            showRow = true;
          }
        } else if (year === filter) {
          // Handle year-only filter
          showRow = true;
        }
      });
    }

    // Apply Symbol Filters
    if (activeSymbolFilters.size > 0) {
      showRow = showRow && activeSymbolFilters.has(symbolCell.textContent.trim());
    }

    row.style.display = showRow ? '' : 'none';
  });
}



    function showNoResultsRow(table, noResults) {
      let noResultsRow = table.querySelector('tbody .no-results');

      if (noResults) {
        if (!noResultsRow) {
          noResultsRow = document.createElement('tr');
          noResultsRow.className = 'no-results';
          const noResultsCell = document.createElement('td');
          noResultsCell.colSpan = table.querySelectorAll('th').length;
          noResultsCell.textContent = 'No matching results';
          noResultsCell.style.textAlign = 'center';
          noResultsRow.appendChild(noResultsCell);
          table.querySelector('tbody').appendChild(noResultsRow);
        }
      } else if (noResultsRow) {
        noResultsRow.remove();
      }
    }

    function createSearchInput() {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search...';
      searchInput.style.width = '100%';
      searchInput.style.marginBottom = '5px';
      searchInput.oninput = (event) => filterCheckboxOptionsBySearch(event.target, searchInput.parentNode);
      return searchInput;
    }

    function filterCheckboxOptionsBySearch(searchInput, dropdownContainer) {
      const filterValue = searchInput.value.toLowerCase();
      const options = dropdownContainer.querySelectorAll('.dropdown-option');
      options.forEach(option => {
        const textValue = option.textContent.toLowerCase();
        option.style.display = textValue.includes(filterValue) ? '' : 'none';
      });
    }

    function createCheckboxOption(text, clickHandler) {
      const container = document.createElement('div');
      container.className = 'dropdown-option';
      container.onclick = () => {
        checkbox.checked = !checkbox.checked;
        clickHandler();
      };

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '5px';
      checkbox.onclick = (event) => {
        event.stopPropagation();
        clickHandler();
      };

      const label = document.createElement('span');
      label.textContent = text;
      container.appendChild(checkbox);
      container.appendChild(label);
      return container;
    }

    function createFilterButton() {
      const filterButton = document.createElement('button');
      filterButton.textContent = '▼';
      filterButton.style.marginLeft = '5px';
      filterButton.style.cursor = 'pointer';
      filterButton.style.border = 'none';
      filterButton.style.background = 'transparent';
      return filterButton;
    }

    function createDropdownContainer() {
      const dropdownContainer = document.createElement('div');
      dropdownContainer.style.position = 'absolute';
      dropdownContainer.style.zIndex = '10';
      dropdownContainer.style.background = '#fff';
      dropdownContainer.style.border = '1px solid #ddd';
      dropdownContainer.style.display = 'none';
      dropdownContainer.style.maxHeight = '200px';
      dropdownContainer.style.overflowY = 'auto';
      dropdownContainer.style.padding = '5px';
      dropdownContainer.onclick = (event) => event.stopPropagation();
      return dropdownContainer;
    }

    let currentOpenDropdown = null;

function attachDropdownToHeader(table, columnIndex, filterButton, dropdownContainer) {
  const headerCell = table.querySelectorAll('th')[columnIndex];

  headerCell.appendChild(filterButton);
  headerCell.appendChild(dropdownContainer);

  dropdownContainer.style.display = 'none'; // Hide by default

  filterButton.addEventListener('click', (event) => {
    event.stopPropagation();

    // Close any previously open dropdown
    if (currentOpenDropdown && currentOpenDropdown !== dropdownContainer) {
      currentOpenDropdown.style.display = 'none';
    }

    // Toggle current dropdown visibility
    const isDropdownVisible = dropdownContainer.style.display === 'block';
    dropdownContainer.style.display = isDropdownVisible ? 'none' : 'block';
    currentOpenDropdown = dropdownContainer.style.display === 'block' ? dropdownContainer : null;
  });

  // Close dropdown when clicking outside, but keep month filter interactive
  document.addEventListener('click', (event) => {
    if (currentOpenDropdown && !dropdownContainer.contains(event.target)) {
      currentOpenDropdown.style.display = 'none';
      currentOpenDropdown = null;
    }
  });

  // Prevent dropdown closure when interacting inside it
  dropdownContainer.addEventListener('click', (event) => event.stopPropagation());
}

function closeDropdownOnClickOutside(event) {
  if (!headerCell.contains(event.target)) {
    dropdownContainer.style.display = 'none';
    document.removeEventListener('click', closeDropdownOnClickOutside);
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

  <div id="active_filters"></div>

  <div id="csv_display" class="csv_table_container">
    <!-- Table will only appear after clicking a button -->
  </div>
</body>
</html>


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


data_pg.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Page</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='scripts.css') }}">
    <script>
        let currentFile = "";  // Stores which file is being viewed

        function fetchCSV(type) {
            currentFile = type;  // Store the last selected file
            updateTable();  // Load immediately
        }

        function updateTable() {
            if (!currentFile) return;  // If no file is selected, do nothing

            fetch(`/get_csv?file=${currentFile}`)
                .then(response => response.text())
                .then(data => {
                    let displayDiv = document.getElementById('csv_display');
                    displayDiv.innerHTML = data;
                    displayDiv.style.display = "block";  // Show table
                })
                .catch(error => {
                    document.getElementById('csv_display').innerHTML = `<p style="color:red;">Error loading data: ${error}</p>`;
                });
        }

        // Automatically refresh every 5 seconds
        setInterval(updateTable, 5000);
    </script>
    <style>
        #csv_display {
            display: none;  /* Hide table initially */
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="header">TERMINAL APP</div>

    <div class="initial_container">
        <button onclick="fetchCSV('input')" class="initial_button">Input File</button>
        <button onclick="fetchCSV('output')" class="initial_button">Output File</button>
    </div>

    <div id="csv_display" class="csv_table_container">
        <!-- Table will only appear after clicking a button -->
    </div>
</body>
</html>


app.py
from flask import Flask, render_template, request
from flask_sock import Sock
import subprocess
import os
import pandas as pd

app = Flask(__name__)
sock = Sock(app)

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/scripts')
def scripts():
    return render_template('scripts.html')

@app.route('/data_pg')
def data_pg():
    return render_template('data_pg.html')

@app.route('/get_csv')
def get_csv():
    file_type = request.args.get('file')

    # Determine which file to fetch
    if file_type == 'input':
        file_path = 'ipoinput.csv'
    elif file_type == 'output':
        file_path = 'ipooutput.csv'
    else:
        return "Invalid file type", 400

    if not os.path.exists(file_path):
        return "<p style='color:red;'>CSV file not found</p>", 404

    try:
        df = pd.read_csv(file_path)
        return df.to_html(classes='table table-striped', index=False)
    except Exception as e:
        return f"<p style='color:red;'>Error reading CSV: {e}</p>", 500

@sock.route('/ws')
def websocket_handler(ws):
    while True:
        try:
            ws.send(">> Enter your name: ")
            user_name = ws.receive().strip()

            ws.send(">> Enter your employee ID: ")
            user_id = ws.receive().strip()

            process = subprocess.Popen(
                ["python", "backend.py"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            backend_input = f"{user_name},{user_id}\n"
            process.stdin.write(backend_input)
            process.stdin.flush()
            process.stdin.close()

            for line in process.stdout:
                ws.send(line)

            for error in process.stderr:
                ws.send(f"Error: {error}")

            process.wait()

        except Exception as e:
            ws.send(f"Error: {str(e)}")
            break

if __name__ == '__main__':
    app.run(debug=True)

    
