app = Flask(__name__)
sock = Sock(app)

def read_csv_with_fallback(file_path):
    """Read CSV with automatic encoding fallback."""
    try:
        return pd.read_csv(file_path, encoding='utf-8')
    except UnicodeDecodeError:
        return pd.read_csv(file_path, encoding='windows-1252')


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
    file_path = 'ipoinput.csv' if file_type == 'input' else 'ipooutput.csv' if file_type == 'output' else None

    if not file_path or not os.path.exists(file_path):
        return "<p style='color:red;'>CSV file not found</p>", 404

    try:
        # Load the CSV file
        df = pd.read_csv(file_path, encoding='windows-1252')

        # Standardize and clean column names
        df.columns = df.columns.str.strip()

        # Ensure the 'IPO Date' column exists before sorting
        if 'IPO Date' in df.columns:
            # Parse dates in the 'IPO Date' column
            df['IPO Date'] = pd.to_datetime(df['IPO Date'], format='%m/%d/%Y', errors='coerce')
            
            # Drop rows where 'IPO Date' couldn't be parsed
            df = df.dropna(subset=['IPO Date'])
            
            # Sort by IPO Date in descending order
            df = df.sort_values(by='IPO Date', ascending=False, inplace=True)

        # Return the DataFrame as an HTML table
        return df.to_html(classes='table table-striped', index=False)
    
    except Exception as e:
        return f"<p style='color:red;'>Error reading CSV: {e}</p>", 500


#csv_display {
      display: none;
      flex-grow: 1;
      overflow: auto;
      padding: 10px;
      border: 1px solid #ddd;
      background-color: #f9f9f9;
      max-width: 100%;
      height: calc(100% - 150px);
  }

  table {
      width: 100%;
      border-collapse: collapse;
  }

  th, td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
  }

  th {
      background-color: #f2f2f2;
      position: sticky;
      top: 0;
      z-index: 1;
  }

  select {
      margin-left: 10px;
  }

  th div:hover {
      background-color: #e0e0e0;
  }

  #active_filters {
      padding: 10px;
      background-color: #f1f1f1;
      display: flex;
      flex-wrap: wrap;
  }

  #active_filters span {
      margin: 5px;
      background-color: #ddd;
      padding: 5px;
      border-radius: 5px;
      cursor: pointer;
  }

  .dropdown-option {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 2px;
  }

  .dropdown-option:hover {
      background-color: #ddd;
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

    
