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



import streamlit as st
import subprocess

# Set page configuration
st.set_page_config(page_title="IPO NASDAQ", layout="wide")

# Custom styles for the Streamlit app
st.markdown("""
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .header {
            background-color: rgb(0, 183, 255);
            color: white;
            text-align: center;
            padding: 10px 0;
            margin-bottom: 20px;
            border-radius: 5px;
        }

        .section {
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .stButton>button {
            background-color: rgb(0, 208, 255);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px; 
            margin-top: 20px;
        }

        .stButton>button:hover {
            background-color: #45a049;
        }
    </style>
""", unsafe_allow_html=True)

# Function to run a script and stream output
def stream_script_output(script_name, *args):
    try:
        process = subprocess.Popen(
            ['python', script_name, *map(str, args)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # Stream output line by line
        output_placeholder = st.empty()
        for line in iter(process.stdout.readline, ''):
            if line:  # Skip empty lines
                output_placeholder.text(line.strip())
        process.stdout.close()
        process.wait()
        if process.returncode != 0:
            error = process.stderr.read()
            st.error(f"Script returned an error:\n{error}")
    except Exception as e:
        st.error(f"Error running the script: {str(e)}")

# Header
st.markdown('<div class="header"><h1>IPO NASDAQ</h1></div>', unsafe_allow_html=True)

# Create three columns for the buttons
col1, col2, col3 = st.columns(3)

# First Column - Script 1
with col1:
    if st.button("Run Script 1", key="script_1"):
        st.markdown("### Script 1 Output:")
        stream_script_output("backend.py", "default_name", "default_id")

# Second Column - Script 2
with col2:
    if st.button("Run Script 2", key="script_2"):
        st.markdown("### Script 2 Output:")
        stream_script_output("script2.py")

# Third Column - Script 3
with col3:
    if st.button("Run Script 3", key="script_3"):
        st.markdown("### Script 3 Output:")
        stream_script_output("script3.py")
