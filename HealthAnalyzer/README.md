# Ingredients Health Analyzer

A mobile app that analyzes product ingredients using Perplexity's Sonar API to provide health assessments.

## Project Overview

The Ingredients Health Analyzer is a React Native mobile app that allows users to capture images of product ingredient labels and receive health assessments. The app uses Perplexity's Sonar API to analyze the ingredients and provide information about potential health concerns, allergens, and more.

## Features

- **Image Capture**: Take photos of ingredient labels using the device camera
- **Ingredient Analysis**: Get instant health assessments of ingredients
- **User Authentication**: Secure login with email and Google via Supabase
- **Scan History**: Keep track of previously scanned products
- **Clean, Minimal UI**: Inspired by similar apps like Yuka and cal.ai

## Tech Stack

### Frontend
- React Native with Expo
- React Navigation for routing
- Supabase Auth for authentication
- Expo Camera for image capture
- Jest for testing

### Backend
- Flask (Python)
- Supabase for data storage and user management
- Perplexity Sonar API for ingredient analysis

## Architecture

The app follows a client-server architecture:

1. **Mobile Frontend**: React Native app that handles UI, camera capture, and user authentication
2. **Backend Server**: Flask API that communicates with Perplexity's Sonar API
3. **Database**: Supabase for user data and scan history storage

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.8+
- Supabase account
- Perplexity API key

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd HealthAnalyzer/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the Supabase configuration in `context/AuthContext.js` with your project credentials.

4. Start the development server:
```bash
npx expo start
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd HealthAnalyzer/backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `env.example` and fill in your credentials.

5. Run the development server:
```bash
flask run
```

## Testing

### Frontend Tests
```bash
cd HealthAnalyzer/frontend
npm test
```

### Backend Tests
```bash
cd HealthAnalyzer/backend
pytest
```

## Deployment

### Frontend
Build the app for Android:
```bash
cd HealthAnalyzer/frontend
expo build:android
```

### Backend
Deploy the Flask API to your preferred cloud platform (e.g., Heroku, AWS, Google Cloud).

## License

MIT

## Acknowledgments

- [Perplexity API](https://www.perplexity.ai/) for providing the AI backend
- [Supabase](https://supabase.io/) for authentication and data storage
- [Expo](https://expo.dev/) for simplifying React Native development 