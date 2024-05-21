import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const API_KEY = '4eea7b8ec53b9333940fb31ff9b303ba';
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState({
    icon: '/icons/default.png',
    color: '#00B9E8'
   
  });
  const getWeatherIconAndColor = (description) => {
    switch (description) {
      case 'clear sky':
        return { icon: '/icons/Clear_Day.png', color: '#00B9E8' }; // Sunny / Day
      case 'few clouds':
        return { icon: '/icons/Few_Clouds_Day.png', color: '#007FFF' }; // Some what Cloudy / Day
      case 'scattered clouds':
        return { icon: '/icons/Few_Clouds_Day.png', color: '#5D8AA8' }; // Cloudy and Haze / Day
      case 'broken clouds':
        return { icon: '/icons/Few_Clouds_Day.png', color: '#5D8AA8' }; // Cloudy and Haze / Night
      case 'overcast clouds':
        return { icon: '/icons/Overcast_cloud.png', color: '#1C313E' }; // Overcast Clouds / Night
      case 'thunderstorm':
        return { icon: '/icons/Thunderstorm.png', color: '#1034A6' }; // Thunderstorm Day and Night
      case 'drizzle':
      case 'rain','light rain','moderate rain':
        return { icon: '/icons/Raining_Day.png', color: '#0047AB' }; // Rain Day and Night
      case 'snow':
        return { icon: '/icons/snow.png', color: '#00B9E8' };
      case 'haze':
        return {icon :'/icons/Atmosphere_2.png', color:'#5D8AA8'} // Snow Clear / Day
      case 'mist':
        return {icon: 'icons/Atmosphere.png', color:'#5D8AA8'}
      default:
        return { icon: '/icons/Raining.png', color: '#00B9E8' }; // Default icon and background color
    }
  };
  const fetchWeatherData = (url) => {
    setLoading(true);
    axios.get(url)
      .then(response => {
        setData(response.data); // adjust if necessary to match your API response structure
        setError(null); // clear previous errors
      })
      .catch(error => {
        setError(error.response && error.response.data.message 
                 ? error.response.data.message 
                 : 'Error fetching weather data');
        console.error('ERROR FETCHING WEATHER DATA:', error);
        setData({}); // reset data on error to ensure consistent state
      })
      .finally(() => {
        setLoading(false);
      });
  };
 
  useEffect(() => {
    let isComponentMounted = true;
    
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isComponentMounted) return;
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            fetchWeatherData(url);
          },
          (error) => {
            if (!isComponentMounted) return;
            setError('Unable to retrieve your location');
            console.error('ERROR GEOLOCATION:', error);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };
  
    getCurrentLocation();
    
    return () => {
      isComponentMounted = false;
    };
    
  }, []);

  useEffect(() => {
  // This useEffect should be responsible for updating weatherInfo when `data` changes.
  if (data.weather && data.weather.length > 0) {
    const newWeatherInfo = getWeatherIconAndColor(data.weather[0].description);
    setWeatherInfo(newWeatherInfo);
  } else {
    // Sets a default state for weatherInfo
    // Be careful to include your initial color as well or any defaults you like.
    setWeatherInfo({
      icon: '/icons/default.png',
      color: '#00B9E8'
    });
  }
}, [data]);
  const searchLocation = (event) => {
    if (event.key === 'Enter' && location.trim() !== '') {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
      fetchWeatherData(url);
      setLocation('');
    }
  };

  const handleInputChange = (event) => {
    setLocation(event.target.value);
  };

  const roundTemperature = (temp) => {
    return Math.round(temp);
  };

  return (
    <div className="App" style={{ backgroundColor: weatherInfo.color }}>
    <div className="search">
      <input
        value={location}
        onChange={handleInputChange}
        onKeyPress={searchLocation}
        placeholder="Enter Location"
        type="text"
      />
    </div>
    {error && <div className="error">{error}</div>} {/* Display any error messages */}
    <div className="container">
      <div className="top">
        <div className="location">
          <p>{data.name}</p>
        </div>
        {data.main && (
          <div className="temp">
            <h1>{roundTemperature(data.main.temp)}°C</h1>
          </div>
        )}
        {data.weather && (
          <div className="description">
            <p>{data.weather[0].description}</p>
          </div>
        )}
      </div>
      <div className="middle">
        {weatherInfo.icon && (
          <div className="icon">
            <img src={weatherInfo.icon} alt="Weather icon" />
          </div>
        )}
      </div>
      {data.main && (
        <div className="bottom">
          <div className="feels">
            <p className="bold">{roundTemperature(data.main.feels_like)}°C</p>
            <p>Feels Like</p>
          </div>
          <div className="humidity">
            <p className="bold">{data.main.humidity}%</p>
            <p>Humidity</p>
          </div>
          {data.wind && (
            <div className="wind">
              <p className="bold">{data.wind.speed.toFixed()} m/s</p>
              <p>Wind Speed</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}

export default App;
  