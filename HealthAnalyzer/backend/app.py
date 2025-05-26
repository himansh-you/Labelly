import os
import base64
import requests
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth

import traceback
load_dotenv(dotenv_path="env.example")

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create handlers
console_handler = logging.StreamHandler()
file_handler = RotatingFileHandler('app.log', maxBytes=10485760, backupCount=10)

# Create formatters
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# Add handlers to the logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

logger.info("Starting Health Analyzer backend")

service_account_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)
db = firestore.client()
logger.info("Firebase initialized successfully")

# Firebase configuration
firebase_config = {
    "apiKey": os.environ.get("FIREBASE_API_KEY"),
    "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
    "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
    "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
    "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
    "appId": os.environ.get("FIREBASE_APP_ID"),
}


# Initialize Perplexity API key
perplexity_api_key = os.environ.get("PERPLEXITY_API_KEY")
logger.info("Perplexity API key initialized")

@app.route("/", methods=["GET"])
def health_check():
    logger.debug("Health check endpoint called")
    return jsonify({"status": "healthy"}), 200


@app.route("/api/analyze", methods=["POST"])
def analyze_ingredients():
    logger.info("Analyze ingredients endpoint called")
    # Check if user is authenticated
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning("Unauthorized access attempt")
        return jsonify({"error": "Unauthorized"}), 401

    # Get JWT token
    token = auth_header.split(" ")[1]

    try:
        # Verify token with Firebase
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        logger.info(f"User authenticated: {user_id}")
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return jsonify({"error": f"Authentication error: {str(e)}"}), 401

    # Process the image
    if "image" not in request.files:
        logger.warning("No image provided in request")
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        logger.warning("Empty image filename")
        return jsonify({"error": "No image selected"}), 400

    logger.info(f"Processing image: {image_file.filename}")
    # Encode image to base64
    image_data = image_file.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")
    image_data_uri = f"data:image/jpeg;base64,{base64_image}"

    # Prepare Perplexity API request
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {perplexity_api_key}",
        "accept": "application/json",
        "content-type": "application/json",
    }

    prompt = """
You are an AI assistant that analyzes food product ingredient labels for health and safety. Given a list of ingredients, categorize them into the following:

- Safe
- Low Risk
- Not Great
- Dangerous

Your response MUST be a valid JSON object and contain no additional formatting or markdown. Return ONLY the JSON object. Do not include any text outside the JSON.

Your task includes:

1. Identify the product name from the label (if available).
2. Provide a general safety score (e.g., "Safe: 95%").
3. Provide a 2-3 sentence summary of the ingredient safety profile.
4. For each category (safe, low_risk, not_great, dangerous):
   - Include only the names of ingredients (for use in collapsed UI cards).
   - Include a breakdown with:
     - The ingredient name
     - A short reason for the classification
     - The amount present in the product (if known; otherwise use "unknown")

Use this exact JSON structure:

{
  "product_name": "string - Name of the product (if visible on label)",
  "safety_score": "string - e.g. 'Safe: 95%'",
  "ingredients_summary": "string - Overall summary paragraph about safety and risks",
  "ingredient_categories": {
    "safe": {
      "ingredients": ["array of safe ingredient names"],
      "details": [
        {
          "ingredient": "ingredient name",
          "reason": "short explanation of why it's considered safe",
          "amount": "string - amount if known, e.g., '5g' or '2%', else 'unknown'"
        }
      ]
    },
    "low_risk": {
      "ingredients": ["array of low risk ingredient names"],
      "details": [
        {
          "ingredient": "ingredient name",
          "reason": "short explanation of why it's considered low risk",
          "amount": "string - amount if known, e.g., '5g' or '2%', else 'unknown'"
        }
      ]
    },
    "not_great": {
      "ingredients": ["array of not great ingredient names"],
      "details": [
        {
          "ingredient": "ingredient name",
          "reason": "short explanation of why it's considered not great",
          "amount": "string - amount if known, e.g., '5g' or '2%', else 'unknown'"
        }
      ]
    },
    "dangerous": {
      "ingredients": ["array of dangerous ingredient names or ['None'] if none"],
      "details": [
        {
          "ingredient": "ingredient name",
          "reason": "short explanation of why it's considered dangerous",
          "amount": "string - amount if known, e.g., '5g' or '2%', else 'unknown'"
        }
      ]
    }
  }
}

Example response:

{
  "product_name": "Cadbury BournVita Malted Chocolate Drink Mix",
  "safety_score": "Safe: 95%",
  "ingredients_summary": "Most ingredients are safe and beneficial for growth, immunity, and energy. Main concern: Sugar content is relatively high—consume in moderation, especially for children. No dangerous ingredients identified by regulators.",
  "ingredient_categories": {
    "safe": {
      "ingredients": [
        "Barley, Wheat (Cereal Extracts)",
        "Cocoa Solids",
        "Milk Solids",
        "Protein Isolates",
        "Vitamins, Minerals",
        "Maltodextrins"
      ],
      "details": [
        {
          "ingredient": "Barley, Wheat (Cereal Extracts)",
          "reason": "Rich in fiber and complex carbohydrates.",
          "amount": "unknown"
        },
        {
          "ingredient": "Cocoa Solids",
          "reason": "Contains antioxidants and adds natural flavor.",
          "amount": "7%"
        },
        {
          "ingredient": "Milk Solids",
          "reason": "Provides calcium and protein for growth.",
          "amount": "unknown"
        },
        {
          "ingredient": "Protein Isolates",
          "reason": "High-quality protein source for muscle repair.",
          "amount": "unknown"
        },
        {
          "ingredient": "Vitamins, Minerals",
          "reason": "Essential micronutrients for overall health.",
          "amount": "1%"
        },
        {
          "ingredient": "Maltodextrins",
          "reason": "Safe carbohydrate used for texture and energy.",
          "amount": "unknown"
        }
      ]
    },
    "low_risk": {
      "ingredients": [
        "Liquid Glucose",
        "Emulsifiers (322, 471)",
        "Raising Agents (500(ii))",
        "Artificial Flavoring Substances"
      ],
      "details": [
        {
          "ingredient": "Liquid Glucose",
          "reason": "Used as a sweetener; safe in moderation.",
          "amount": "unknown"
        },
        {
          "ingredient": "Emulsifiers (322, 471)",
          "reason": "Generally safe but can cause issues in high doses for sensitive individuals.",
          "amount": "unknown"
        },
        {
          "ingredient": "Raising Agents (500(ii))",
          "reason": "Common baking ingredient with low health impact.",
          "amount": "unknown"
        },
        {
          "ingredient": "Artificial Flavoring Substances",
          "reason": "Approved for use but may cause reactions in sensitive individuals.",
          "amount": "unknown"
        }
      ]
    },
    "not_great": {
      "ingredients": [
        "Sugar",
        "Permitted Color (150c, Caramel)"
      ],
      "details": [
        {
          "ingredient": "Sugar",
          "reason": "High amounts contribute to obesity and tooth decay.",
          "amount": "32g"
        },
        {
          "ingredient": "Permitted Color (150c, Caramel)",
          "reason": "Some types of caramel color have been linked to health concerns in excess.",
          "amount": "0.1%"
        }
      ]
    },
    "dangerous": {
      "ingredients": ["None"],
      "details": []
    }
  }
}
"""


    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and concise."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data_uri}},
                ],
            },
        ],
        "web_search_options": {"search_context_size": "medium"},
    }

    try:
        logger.info("Calling Perplexity API")
        # Call Perplexity API
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        perplexity_data = response.json()
        logger.info("Perplexity API call successful")

        # Store scan in Firestore
        logger.info("Storing scan data in Firestore")
        scan_data = {
            "user_id": user_id,
            "analysis_result": perplexity_data,
            "timestamp": firestore.SERVER_TIMESTAMP,
        }

        # Insert scan data into Firestore
        db.collection("scans").add(scan_data)
        logger.info("Scan data stored successfully")

        # Return the analysis to the client
        return (
            jsonify(
                {
                    "analysis": perplexity_data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "No analysis available"),
                    "citations": perplexity_data.get("citations", []),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500


@app.route("/api/user/scans", methods=["GET"])
def get_user_scans():
    logger.info("Get user scans endpoint called")
    # Check if user is authenticated
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning("Unauthorized access attempt")
        return jsonify({"error": "Unauthorized"}), 401

    # Get JWT token
    token = auth_header.split(" ")[1]

    try:
        # Verify token with Firebase
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        logger.info(f"User authenticated: {user_id}")

        # Get user scans from Firestore
        logger.info(f"Retrieving scans for user: {user_id}")
        scans_ref = (
            db.collection("scans")
            .where("user_id", "==", user_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
        )
        scans = scans_ref.stream()

        # Convert to list of dictionaries
        scans_data = []
        for scan in scans:
            scan_dict = scan.to_dict()
            scan_dict["id"] = scan.id  # Add document ID
            scans_data.append(scan_dict)

        logger.info(f"Retrieved {len(scans_data)} scans")
        return jsonify({"scans": scans_data}), 200

    except Exception as e:
        logger.error(f"Error retrieving scans: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Error retrieving scans: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask app on port {port}")
    app.run(debug=True, host="0.0.0.0", port=port)
