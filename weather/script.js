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
  <title>TERMINAL APP</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .header {
      background: #333;
      color: #fff;
      padding: 20px;
      font-size: 24px;
      text-align: center;
    }
    .button-container {
      margin: 20px;
      text-align: center;
    }
    .button {
      margin: 10px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
    }
    .dummy {
      background-color: #ccc;
      color: #333;
    }
    .run {
      background-color: #28a745;
      color: #fff;
    }
    #terminal-container {
      margin: 20px auto;
      width: 80%;
      height: 400px;
      border: 1px solid #333;
      text-align: left; /* Ensures text is left-aligned */
    }
  </style>
</head>
<body>
  <div class="header">TERMINAL APP</div>
  <div class="button-container">
    <button class="button dummy">Dummy Button 1</button>
    <button class="button dummy">Dummy Button 2</button>
    <button class="button run" id="run-script">Run Script 1</button>
  </div>
  <div id="terminal-container"></div>

  <script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <script>
    const terminalContainer = document.getElementById("terminal-container");
    const runScriptButton = document.getElementById("run-script");
    const term = new Terminal({ convertEol: true }); // Ensures newlines work correctly
    term.open(terminalContainer);

    let socket;
    let inputBuffer = ""; // Buffer for user input

    runScriptButton.addEventListener("click", () => {
      term.write("Connecting to backend...\r\n");

      // Connect to the backend using Socket.IO
      socket = io.connect();

      socket.on('connect', () => {
        term.write("Connection established. Please enter your details below:\r\n");

        // Listen for user input and process it
        term.onData((data) => {
          if (data === "\r") {
            // When Enter is pressed, send the buffered input to the backend
            socket.emit('run_command', { name: inputBuffer.split(',')[0], emp_id: inputBuffer.split(',')[1] });
            inputBuffer = ""; // Clear the buffer
            term.write("\r\n"); // Move to the next line
          } else if (data === "\u007F") {
            // Handle Backspace
            if (inputBuffer.length > 0) {
              inputBuffer = inputBuffer.slice(0, -1); // Remove last character
              term.write("\b \b"); // Remove character visually in terminal
            }
          } else {
            // Append typed character to the buffer and display it
            inputBuffer += data;
            term.write(data);
          }
        });
      });

      // Display messages from the backend in the terminal
      socket.on('response', (message) => term.write(message + '\r\n'));
      socket.on('disconnect', () => term.write("\r\nConnection closed.\r\n"));
      socket.on('error', (err) => term.write(`\r\nSocket.IO Error: ${JSON.stringify(err)}\r\n`));
    });
  </script>
</body>
</html>


from flask import Flask, render_template
from flask_sock import Sock
import subprocess

app = Flask(__name__)
sock = Sock(app)

@app.route('/')
def index():
    return render_template('index.html')

@sock.route('/ws')
def websocket_handler(ws):
    while True:
        try:
            # Step 1: Ask for the name
            ws.send(">> Enter your name: ")
            user_name = ws.receive().strip()

            # Step 2: Ask for the ID
            ws.send(">> Enter your employee ID: ")
            user_id = ws.receive().strip()

            # Step 3: Send inputs to backend logic
            # Using subprocess to call backend.py (or implement backend logic directly here)
            process = subprocess.Popen(
                ["python", "backend.py"],  # backend.py will take inputs dynamically
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Pass inputs to backend.py (as a single string "name,id")
            backend_input = f"{user_name},{user_id}\n"
            stdout, stderr = process.communicate(input=backend_input)

            # Step 4: Return backend results to the client
            if stdout:
                ws.send(stdout)
            if stderr:
                ws.send(f"Error: {stderr}")

        except Exception as e:
            ws.send(f"Error: {str(e)}")
            break


if __name__ == '__main__':
    app.run(debug=True)


import sys

# Read combined input from stdin
input_data = sys.stdin.read().strip()

# Split the input into name and ID
try:
    name, emp_id = input_data.split(",", 1)
    name = name.strip()
    emp_id = emp_id.strip()
    

    # Dynamic logic for processing inputs
    if name.lower() == "aastha":
        print(f"Hello, Aastha! Your Employee ID is {emp_id}.")
    elif name.lower() == "aniket":
        print(f"Hi, Aniket! Your Employee ID is {emp_id}.")
    elif emp_id.isdigit():
        print(f"Employee ID {emp_id} is valid!")
    else:
        print(f"Welcome, {name.capitalize()}!")
except ValueError:
    print("Error: Invalid input format. Please provide both name and ID.")
