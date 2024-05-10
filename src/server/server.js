// Load environment variables
require('dotenv').config();
const moment = require('moment');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 8000;

// Enable all CORS requests
app.use(cors(
    {
        origin: '*'
    }
));

// Constants and global variables
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const WEATHERBIT_BASE_URL = 'https://api.weatherbit.io/v2.0';
const PIXABAY_BASE_URL = 'https://pixabay.com/api';
let trips = [];
let currentId = 1;

// Create a router
const apiRouter = express.Router();

// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to fetch the image URL from Pixabay
apiRouter.get('/get-image-url', async (req, res) => {
    const defaultImage = 'https://via.placeholder.com/300x200?text=Travel+Image';
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const pixabayUrl = `${PIXABAY_BASE_URL}/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo`;

    try {
        const response = await axios.get(pixabayUrl);
        if (response.data.hits.length > 0) {
            const imageUrl = response.data.hits[0].webformatURL;
            res.json({ imageURL: imageUrl });
        } else {
            res.json({ imageURL: defaultImage });
        }
    } catch (error) {
        console.error('Error fetching image URL:', error.message);
        res.status(error.response.status).json({ error: error.message });
    }
});


// Endpoint to fetch weather data
apiRouter.post('/get-weather', async (req, res) => {
    const { destination, date } = req.body;
    const currentDate = moment();
    const targetDate = moment(date, 'YYYY-MM-DD');
    const dayDifference = targetDate.diff(currentDate, 'days');

    try {
        let weatherEndpoint;
        if (dayDifference <= 7) {
            // Call the current weather API
            weatherEndpoint = `${WEATHERBIT_BASE_URL}/current?city=${destination}&key=${WEATHERBIT_API_KEY}`;
        } else {
            // Call the 16-day weather forecast API
            weatherEndpoint = `${WEATHERBIT_BASE_URL}/forecast/daily?city=${destination}&key=${WEATHERBIT_API_KEY}`;
        }

        const weatherResponse = await axios.get(weatherEndpoint);
        const weatherData = weatherResponse.data.data[0];

        res.json({
            high: weatherData.high_temp || 'N/A',
            low: weatherData.low_temp || 'N/A',
            description: weatherData.weather.description || 'No description available'
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ message: 'Error retrieving weather data.' });
    }
});


// Endpoint to save a new trip
apiRouter.post('/save-trip', (req, res) => {
    const trip = { ...req.body, id: currentId++ };
    trips.push(trip);
    res.json({ tripCardId: trip.id });
});

// Endpoint to delete a trip by its ID
apiRouter.delete('/delete-trip/:id', (req, res) => {
    const tripId = parseInt(req.params.id, 10);
    trips = trips.filter(trip => trip.id !== tripId);
    res.sendStatus(200);
});

// Endpoint to get all trips
apiRouter.get('/get-trips', (req, res) => {
    res.json(trips);
});

// Use the router with the '/api' prefix
app.use('/api', apiRouter);

// Start the server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;