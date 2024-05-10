

describe('DOM Manipulations', () => {
    beforeAll(() => {
        // Mocking the HTML elements
        document.body.innerHTML =
            document.body.innerHTML =
            '<div>' +
            '  <button id="addTripBtn"></button>' +
            '  <form id="tripForm" style="display: none;">' +
            '    <input type="text" id="location" placeholder="Enter location">' +
            '    <input type="date" id="departing" placeholder="MM/DD/YYYY">' +
            '    <button type="button" id="saveTripBtn">Save Trip</button>' +
            '  </form>' +
            '</div>';
    });


    it('toggles form display on button click', () => {
        require('../src/assets/js/scripts.js');
        const addButton = document.getElementById('addTripBtn');
        const form = document.getElementById('tripForm');
        expect(form.style.display).toBe('none');

        // Simulate button click
        addButton.click();
        expect(form.style.display).toBe('block');
    });

});

describe('calculateDaysRemaining', () => {

    it('returns positive number of days when the departing date is in the future', () => {
        const { calculateDaysRemaining } = require('../src/assets/js/scripts.js'); // Adjust the path to where scripts.js is located
        const today = new Date();
        const departing = new Date();
        departing.setDate(today.getDate() + 10); // Set departing date 10 days in the future

        const daysRemaining = calculateDaysRemaining(departing);

        expect(daysRemaining).toBe(10);
    });

    it('returns 0 when the departing date is today', () => {
        const { calculateDaysRemaining } = require('../src/assets/js/scripts.js'); // Adjust the path to where scripts.js is located
        const today = new Date();
        const departing = new Date();

        const daysRemaining = calculateDaysRemaining(departing);

        expect(daysRemaining).toBe(0);
    });

    it('returns negative number of days when the departing date is in the past', () => {
        const { calculateDaysRemaining } = require('../src/assets/js/scripts.js'); // Adjust the path to where scripts.js is located
        const today = new Date();
        const departing = new Date();
        departing.setDate(today.getDate() - 10); // Set departing date 10 days in the past

        const daysRemaining = calculateDaysRemaining(departing);

        expect(daysRemaining).toBe(-10);
    });

});

describe('createTripCard', () => {
    it('creates a card with the correct data', () => {
        const { createTripCard } = require('../src/assets/js/scripts.js');
        const imageURL = 'https://example.com/image.jpg';
        const location = 'Paris';
        const departing = '2024-06-15';
        const flightInfo = 'Flight 123, AF Air';
        const weatherData = { high: 30, low: 20, description: 'Sunny' };
        const id = 1;

        const tripCard = createTripCard(imageURL, location, departing, flightInfo, weatherData, id);

        // Validate the structure and content
        expect(tripCard).toBeInstanceOf(HTMLElement);
        expect(tripCard.querySelector('h2').textContent).toBe(location);
        expect(tripCard.querySelector('img').getAttribute('src')).toBe(imageURL);
        expect(tripCard.querySelector('img').getAttribute('alt')).toBe('Travel Image');
        expect(tripCard.querySelectorAll('p')[0].textContent).toContain(departing);
        expect(tripCard.querySelectorAll('p')[1].textContent).toContain(flightInfo);
        expect(tripCard.querySelectorAll('button')[3].textContent).toContain('Remove Trip');
    });
});

const axios = require('axios');
jest.mock('axios');

describe('getWeatherForecast', () => {
    beforeAll(() => {
        // Mocking the HTML elements
        document.body.innerHTML =
            '<div id="weatherData">' +
            '  <p id="high"></p>' +
            '  <p id="low"></p>' +
            '  <p id="description"></p>' +
            '</div>' +
            '<div id="loader" style="display: none;">Loading...</div>';
    });

    it('returns default weather data on failed API call', async () => {
        const { getWeatherForecast } = require('../src/assets/js/scripts.js');
        const destination = 'New York';
        const date = '2024-06-15';
        axios.post.mockRejectedValue(new Error('Network Error'));

        const weather = await getWeatherForecast(destination, date);

        expect(weather).toEqual({
            high: 'N/A',
            low: 'N/A',
            description: 'Fetch request failed.',
        });
    });
});

describe('saveTripToServer', () => {
    it('returns the trip card ID on successful save', async () => {
        const { saveTripToServer } = require('../src/assets/js/scripts.js');
        const tripCardData = { location: 'Paris', departing: '2024-06-15' };
        const response = { data: { tripCardId: 123 } };
        axios.post.mockResolvedValue(response);

        const tripCardId = await saveTripToServer(tripCardData);

        expect(tripCardId).toBe(123);
    });

    it('returns undefined on failed save', async () => {
        const { saveTripToServer } = require('../src/assets/js/scripts.js');
        const tripCardData = { location: 'Paris', departing: '2024-06-15' };
        axios.post.mockRejectedValue(new Error('Server Error'));

        const tripCardId = await saveTripToServer(tripCardData);

        expect(tripCardId).toBeUndefined();
    });
});

describe('deleteTripCard', () => {
    beforeEach(() => {
        // Mocking the trip card in the DOM
        document.body.innerHTML =
            '<div id="tripCard-1">' +
            '  <button class="removeTripBtn"></button>' +
            '</div>' +
            '<div id="loader" style="display: none;">Loading...</div>';
    });

    it('removes the card from the DOM on successful delete', async () => {
        const { deleteTripCard } = require('../src/assets/js/scripts.js');
        axios.delete.mockResolvedValue({ status: 200 });

        await deleteTripCard(1);

        const card = document.getElementById('tripCard-1');
        expect(card).toBeNull(); // Card should be removed
    });

    it('does not remove the card if the delete fails', async () => {
        const { deleteTripCard } = require('../src/assets/js/scripts.js');
        axios.delete.mockRejectedValue(new Error('Server Error'));

        await deleteTripCard(1);

        const card = document.getElementById('tripCard-1');
        expect(card).not.toBeNull(); // Card should still exist
    });
});

describe('loadTripCards', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tripCardsContainer"></div>'+
        '<div id="loader" style="display: none;">Loading...</div>';
    });

    it('loads and displays the trip cards correctly', async () => {
        const { loadTripCards } = require('../src/assets/js/scripts.js');
        const response = {
            data: [
                {
                    id: 1,
                    imageURL: 'https://example.com/image1.jpg',
                    location: 'Paris',
                    departing: '2024-06-15',
                    flightInfo: 'Flight 123, AF Air',
                    weatherData: { high: 30, low: 20, description: 'Sunny' }
                },
                {
                    id: 2,
                    imageURL: 'https://example.com/image2.jpg',
                    location: 'New York',
                    departing: '2024-07-01',
                    flightInfo: 'Flight 456, NY Air',
                    weatherData: { high: 28, low: 18, description: 'Partly Cloudy' }
                }
            ]
        };
        axios.get.mockResolvedValue(response);

        await loadTripCards();

        const container = document.getElementById('tripCardsContainer');
        expect(container.children.length).toBe(2); // Ensure both cards are present
        expect(container.children[0].querySelector('h2').textContent).toBe('Paris');
        expect(container.children[1].querySelector('h2').textContent).toBe('New York');
    });
});
