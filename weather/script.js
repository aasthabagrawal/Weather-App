runScriptButton.addEventListener("click", () => {
  // Close any existing WebSocket connection
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.onclose = null; // Remove the old onclose handler
    socket.onerror = null; // Remove the old onerror handler
    socket.onmessage = null; // Remove the old onmessage handler
    socket.close();
  }

  // Reset the terminal
  term.reset();
  inputBuffer = ""; // Clear the input buffer

  term.write("Connecting to backend...\r\n");

  try {
    // Establish a new WebSocket connection
    socket = new WebSocket(`ws://${location.host}/ws`);

    socket.onopen = () => {
      term.write("Connection established. Please enter your details below:\r\n");

      // Remove the previous input handler, if any
      if (inputHandler) {
        term.offData(inputHandler); // Remove the old listener explicitly
      }

      // Define the input handler
      inputHandler = (data) => {
        if (data === "\r") {
          // When Enter is pressed, send the buffered input to the backend
          term.write("\r\nWaiting for response...\r\n"); // Display waiting message
          socket.send(inputBuffer);
          inputBuffer = ""; // Clear the buffer
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
      };

      // Attach the new input handler
      term.onData(inputHandler);
    };

    // Handle WebSocket events
    socket.onmessage = (event) => {
      term.write(`\r\n${event.data}\r\n`); // Display the backend response
    };

    socket.onclose = () => {
      term.write("\r\nConnection closed.\r\n");
    };

    socket.onerror = (err) => {
      term.write(`\r\nWebSocket Error: ${JSON.stringify(err)}\r\n`);
    };
  } catch (error) {
    term.write(`\r\nFailed to connect: ${error.message}\r\n`);
  }
});

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



<style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f4f4f4;
      
    }

    .header {
      background: #333;
      color: #fff;
      padding: 1rem;
      font-size: 24px;
      width: 100%;
      text-align: center;
    }

    .parent-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 1rem;
      flex-grow: 1;
      height: 100%; 
    }

    .button-container {
      margin-top: 1rem;
      display: flex;
      gap: 100px;
    }

    .button {
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
      width: 90%;
      height: 100%;
      flex-grow: 1;
      border: 1px solid #333;
      background-color: black;
      margin-top: 1rem;
      overflow: hidden;
      display: flex;
      padding-bottom: 2 rem;
    }

    /* Ensure the terminal fills the container properly */
    .xterm {
      flex-grow: 1;
      width: 95% !important;
      height: 100% !important;
      display: flex;
      overflow: hidden;
    }

    /* Fix scrollbar position */
    .xterm-viewport {
      right: 0;
      width: 100% !important;
    }
  </style>


const runScriptButton = document.getElementById("run-script");
  const term = new Terminal({ convertEol: true, wordWrap: true}); // Ensures newlines work correctly
  term.open(terminalContainer);


  function resizeTerminal() {
  const container = document.getElementById("terminal-container");
   // Force reflow to fix incorrect resizing
   container.style.display = "none";
  container.offsetHeight; // Trigger reflow
  container.style.display = "flex";

  const width = container.clientWidth * 0.95;  // Maintain 95% width
  const height = container.clientHeight;       // Keep full height
  
  const cols = Math.floor(width / 9);  // Approximate character width
  const rows = Math.floor(height / 18); // Approximate character height
  term.resize(cols, rows);
}

window.addEventListener("resize", resizeTerminal);
resizeTerminal();  // Call initially to set correct size

  const container = document.getElementById('terminal-container');

  //term.resize(1000,1000);
  let socket; // Declare the socket outside for reuse
