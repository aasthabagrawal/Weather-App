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



Share

AA
You said:
import streamlit as st
import subprocess

# Set page configuration, horizontal textbox
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

# Function to run backend script and return output
def run_backend_script(script_name, var1, var2):
    try:
        result = subprocess.run(
            ['python', script_name, str(var1), str(var2)],
            capture_output=True,
            text=True,
        )
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error running the script: {str(e)}"

# Initialize session state variables
if "show_inputs" not in st.session_state:
    st.session_state.show_inputs = False

# Header
st.markdown('<div class="header"><h1>IPO NASDAQ</h1></div>', unsafe_allow_html=True)

# Create three columns for the textboxes
col1, col2, col3 = st.columns(3)

# First Column - Script 1
with col1:
    #st.text_area("Script 1", placeholder="Script 1 output here", height=150)
    # Run Script 1 button
    if st.button("Run Script 1", key="Script 1"):
        st.session_state.show_inputs = True  # Show input fields when button is clicked

    # Show input fields if "Run Script 1" was clicked
    if st.session_state.show_inputs:
        emp_name = st.text_input("Enter employee name:")
        emp_id = st.text_input("Enter employee ID:")
        if st.button("Submit Script 1"):
            if emp_name and emp_id:
                # Run the backend script and display output
                output = run_backend_script('backend.py', emp_name, emp_id)
                st.text_area("Script 1 Output", output, height=300)
            else:
                st.warning("Please enter both values.")

# Second Column - Placeholder for Script 2
with col2:
    #st.text_area("Script 2", placeholder="Script 2 output here", height=150)
    if st.button("Run Script 2", key="Script 2"):
        st.success("Script 2 is running...")

# Third Column - Placeholder for Script 3
with col3:
    #st.text_area("Script 3", placeholder="Script 3 output here", height=150)
    if st.button("Run Script 3", key="Script 3"):
        st.success("Script 3 is running...")
