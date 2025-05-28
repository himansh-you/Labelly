# Labelly

An AI-powered mobile application that instantly analyzes food ingredient labels to provide health insights, safety scores, and healthier product alternatives.

## 🚀 Features

- **Instant Ingredient Analysis**: Scan food labels with your camera for immediate health assessments
- **AI-Powered Safety Scoring**: Get comprehensive safety scores categorized as Safe, Low Risk, Not Great, and Dangerous
- **Smart Alternative Recommendations**: Discover healthier product alternatives with purchase links
- **Allergen Detection**: Automatic identification of allergens and harmful additives
- **Scan History**: Track previously analyzed products with user authentication
- **Interactive UI**: Clean, intuitive interface with smooth animations and collapsible categories
- **Real-time Analysis**: Powered by Perplexity Sonar API for up-to-date ingredient research

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native with Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **Tamagui** - UI components and theming
- **React Native Reanimated** - Advanced animations
- **Expo Camera** - Camera functionality for label scanning
- **Firebase SDK** - Authentication and data management

### Backend (API Server)
- **Python Flask** - REST API framework
- **Firebase Admin SDK** - Server-side authentication
- **Firebase Firestore** - NoSQL database
- **Perplexity Sonar API** - AI ingredient analysis
- **Gunicorn** - Production WSGI server

### External Services
- **Firebase Authentication** - User management
- **Firebase Firestore** - Data storage
- **Perplexity API** - AI-powered analysis engine

## 📱 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Firebase project setup
- Perplexity API key
- Expo CLI

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/labelly-healthanalyzer.git
cd labelly-healthanalyzer

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and Firebase config

# Run the Flask server
python app.py
```

### Environment Variables

Create a `.env` file in the backend directory:

```bash
PERPLEXITY_API_KEY=your_perplexity_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 🎯 Usage

1. **Sign Up/Login**: Create an account or sign in using email/password or Google authentication
2. **Scan Ingredient Label**: Use the camera to capture a food product's ingredient list
3. **Review Analysis**: Get instant safety scores and detailed ingredient breakdowns
4. **Explore Alternatives**: Discover healthier product recommendations with purchase links
5. **Track History**: Access your previous scans in the history section

## 🔌 API Endpoints

### Analyze Ingredients
```http
POST /api/analyze
Content-Type: multipart/form-data
Authorization: Bearer 

Body: image file (JPEG)
```

### Get Alternative Products
```http
POST /api/alternatives
Content-Type: application/json
Authorization: Bearer 

Body: {
  "original_analysis": 
}
```

## 📊 Response Format

### Analysis Response
```json
{
  "product_name": "Product Name",
  "safety_score": "Safe: 95%",
  "ingredients_summary": "Overall ingredient assessment",
  "ingredient_categories": {
    "safe": {
      "ingredients": ["ingredient1", "ingredient2"],
      "details": [
        {
          "ingredient": "ingredient1",
          "reason": "Natural and safe",
          "amount": "2g"
        }
      ]
    },
    "low_risk": { /* similar structure */ },
    "not_great": { /* similar structure */ },
    "dangerous": { /* similar structure */ }
  },
  "allergen_additive_warnings": ["Contains nuts", "High sodium"],
  "product_summary": "Detailed product health summary"
}
```


## 🏗️ Project Structure

```
labelly-healthanalyzer/
├── frontend/
│   ├── app/                 # Expo Router pages
│   ├── components/          # Reusable components
│   ├── services/           # API services
│   └── types/              # TypeScript definitions
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── README.md
```

## 🚦 Development Status

This project was developed as part of a hackathon submission. Key features are functional, including:

- ✅ Camera-based ingredient scanning
- ✅ AI-powered health analysis
- ✅ User authentication
- ✅ Alternative product recommendations
- ✅ Scan history tracking
- ✅ Cross-platform mobile app


## 🔗 Demo
![IMG-20250528-WA0016 (Small)](https://github.com/user-attachments/assets/235632bc-0c36-4dd9-aabb-f147387db8db)

Working demo : https://labelly--40iw2plma1.expo.app/onboarding
accounts to use : user1@gmail.com(pass: 123456), user2@gmail.com(pass: 123456), deepuser1@gmail.com(pass : 12345678) 

---

**Made with ❤️ for healthier eating choices**
