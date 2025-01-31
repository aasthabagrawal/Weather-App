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






