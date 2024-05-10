# Travel Planner Application

Travel Planner is a simple web application designed to help users create, store, and manage their travel plans. This application integrates with third-party APIs to gather beautiful images of destinations and related weather data, providing a visual experience for users.

## Features

- **Add Trip**: Users can add trip details, including the destination and departure date.
- **Save and Delete Trip**: Save the trip in the application or delete it when it's no longer needed.
- **Weather Forecast**: Provides weather predictions for the destination, offering information like high and low temperatures and general descriptions.
- **Destination Images**: Displays beautiful images from the Pixabay API based on the user's destination.

## Installation Guide

### Prerequisites

- Node.js >= 14.x
- npm >= 6.x

### Steps

1. **Clone the Project**

   ```bash
   git clone https://github.com/saitamacoder196/travel-app.git
   ```

2. **Install Dependencies**

   ```bash
   cd travel-app
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the project's root directory with the following content:

   ```env
   PIXABAY_API_KEY=<YOUR_PIXABAY_API_KEY>
   WEATHERBIT_API_KEY=<YOUR_WEATHERBIT_API_KEY>
   ```

   Replace `<YOUR_PIXABAY_API_KEY>` and `<YOUR_WEATHERBIT_API_KEY>` with your actual API keys.

4. **Start the Server**

   ```bash
   npm run server
   ```

   The server will run at `http://localhost:8000`.

5. **Run the Application**

   To run the application in development mode with Webpack Dev Server:

   ```bash
   npm start
   ```

   The application will automatically open in your browser at `http://localhost:3000`.

6. **Build for Production**

   If you want to build a production version of the application, use:

   ```bash
   npm run build
   ```

   The content will be saved in the `dist/` folder.

## Testing

The application uses Jest to test core features. To run all tests, use the following command:

```bash
npm test
```