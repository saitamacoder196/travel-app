const axios = require('axios');

// define constants and variables
const baseUrl = 'http://localhost:8000/api';

// Toggle the visibility of the form when "Add Trip" is clicked
const addButton = document.getElementById('addTripBtn');
if (addButton) {
    addButton.addEventListener('click', function() {
        const form = document.getElementById('tripForm');
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    });
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function createTripCard(imageURL, location, departing, flightInfo, weatherData, id) {
    const tripCard = document.createElement('div');
    tripCard.className = 'tripCard';
    tripCard.id = `tripCard-${id}`;
    tripCard.innerHTML = `
        <img src="${imageURL}" alt="Travel Image">
        <h2>${location}</h2>
        <p>Departing: ${departing}</p>
        <p>${flightInfo}</p>
        <button>Add Lodging Info</button>
        <button>Add Packing List</button>
        <button>Add Notes</button>
        <p>Location: ${location}, Days Remaining: ${calculateDaysRemaining(departing)}</p>
        <p>Weather: High: ${weatherData.high}, Low: ${weatherData.low}, Description: ${weatherData.description}</p>
        <button class="removeTripBtn">Remove Trip</button>
    `;

    const removeTripBtn = tripCard.querySelector('.removeTripBtn');
    removeTripBtn.addEventListener('click', function() {
        deleteTripCard(id);
    });

    return tripCard;
}

async function deleteTripCard(id) {
    showLoader();
    try {
        const response = await axios.delete(`${baseUrl}/delete-trip/${id}`);

        if (response.status === 200) {
            const tripCard = document.getElementById(`tripCard-${id}`);
            tripCard.parentNode.removeChild(tripCard);
        } else {
            console.error('Error deleting trip card:', response.statusText);
        }
    } catch (error) {
        console.error('Delete request failed:', error.message);
    }
    finally {
        hideLoader();
    }
}

async function loadTripCards() {
    showLoader();
    try {
        const response = await axios.get(`${baseUrl}/get-trips`);
        console.log('Received trip cards:', response.data);
        const tripCardsData = response.data;

        for (const tripCardData of tripCardsData) {
            const { id, imageURL, location, departing, flightInfo, weatherData } = tripCardData;
            const tripCard = createTripCard(imageURL, location, departing, flightInfo, weatherData, id);
            document.getElementById('tripCardsContainer').appendChild(tripCard);
        }
    } catch (error) {
        console.error(`Error loading trip cards from server: ${error}`);
    }
    finally {
        hideLoader();
    }
}

async function saveTripToServer(tripCardData) {
    showLoader();
    try {
        const response = await axios.post(`${baseUrl}/save-trip`, tripCardData);
        return response.data.tripCardId;
    } catch (error) {
        console.error(`Error saving trip to server: ${error}`);
    }
    finally {
        hideLoader();
    }
}

// Handle trip card creation
document.getElementById('saveTripBtn').addEventListener('click', async function() {
    const location = document.getElementById('location').value;
    const departing = document.getElementById('departing').value;

    if (!location) {
        console.log('Please enter a location.');
        return;
    }

    showLoader();
    try {
        // Construct the API URL with the location query
        const apiUrl = `${baseUrl}/get-image-url?q=${encodeURIComponent(location)}`;
        console.log('Making request to:', apiUrl);

        // Make the request using Axios
        const imageURLResponse = await axios.get(apiUrl);

        if (imageURLResponse.status !== 200) {
            console.error('Error fetching image URL:', imageURLResponse.statusText);
            return;
        }
        // Handle the API response (e.g., display the image URL or message)
        const imageURL = imageURLResponse.data.imageURL;
        console.log('Received Image URL:', imageURL);

        const flightInfo = 'ORD 3.00PM Flight 22 UDACITY AIR';

         // Fetch the weather forecast data
         const weatherData = await getWeatherForecast(location, departing);

        // Save the trip to the server
        const tripCardData = { imageURL, location, departing, flightInfo, weatherData };
        const tripCardId = await saveTripToServer(tripCardData);
       
    
        const tripCard = createTripCard(imageURL, location, departing, flightInfo, weatherData, tripCardId);
        document.getElementById('tripCardsContainer').appendChild(tripCard);
    
        // Clear form inputs and hide the form
        document.getElementById('location').value = '';
        document.getElementById('departing').value = '';
        document.getElementById('tripForm').style.display = 'none';
        // Here, you can update the DOM or perform any other actions needed
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error('Error fetching image URL:', error.message);
    }
    finally {
        hideLoader();
    }

});

// Client-side function to fetch the weather forecast data
async function getWeatherForecast(destination, date) {
    showLoader();
    try {
        // Make a POST request to the server with the destination and date
        const response = await axios.post(`${baseUrl}/get-weather`, { destination, date });

        console.log('Received weather data:', response.data);
        // Parse the JSON response
        if (response.status === 200) {
            return response.data;
        } else {
            console.error('Error retrieving weather data:', response.statusText);
            return {
                high: 'N/A',
                low: 'N/A',
                description: 'Unable to retrieve weather information.'
            };
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
        return {
            high: 'N/A',
            low: 'N/A',
            description: 'Fetch request failed.'
        };
    }
    finally {
        hideLoader();
    }
}

// Calculate remaining days until departure date
function calculateDaysRemaining(departingDate) {
    const today = new Date();
    const departureDate = new Date(departingDate);
    const diffTime = departureDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}

document.addEventListener('DOMContentLoaded', function() {
    loadTripCards();
});

// Export the function
module.exports = { 
    calculateDaysRemaining, 
    createTripCard,
    getWeatherForecast,
    deleteTripCard,
    saveTripToServer,
    loadTripCards,
};