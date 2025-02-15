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

@app.route('/data_pg')
def data_pg():
    return render_template('data_pg.html')




@app.route('/get_csv')
def get_csv():
    file_type = request.args.get('file')

    file_path = 'ipoinput.csv' if file_type == 'input' else 'ipooutput.csv' if file_type == 'output' else None

    if not file_path or not os.path.exists(file_path):
        return {"error": "CSV file not found"}, 404

    try:
        df = read_csv_with_fallback(file_path)

        # Normalize column names to lowercase for consistency
        df.columns = df.columns.str.strip().str.lower()

        # Ensure IPO date column is present and handle sorting
        if 'ipo date' in df.columns:
            df['ipo date'] = pd.to_datetime(df['ipo date'], errors='coerce')
            df = df.dropna(subset=['ipo date'])  # Remove rows with invalid dates
            df = df.sort_values(by='ipo date', ascending=False)
            df['ipo date'] = df['ipo date'].dt.strftime('%m/%d/%Y')

       
        # Return the entire dataframe as JSON
        return df.to_json(orient='records')

    except Exception as e:
        return {"error": f"Error reading CSV: {e}"}, 500

