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
    Analyze the safety of a consumer product based on its ingredients listed in the attached image.

    Return a brief and focused report that includes only ingredients that are potentially unsafe, controversial, or regulated.

    For each flagged ingredient, provide:

    Name

    Concern (e.g., allergen, carcinogen, hormone disruptor)

    Regulatory status (e.g., restricted in EU, banned in certain countries, limited by FDA)

    Risk level: Moderate / High

    End with an Overall Safety Verdict:

    Safe (no concerning ingredients)

    Conditionally Safe (some concerns, but acceptable in low use)

    Potentially Unsafe (clear risks or heavy restrictions)

    Keep your response concise, bullet-pointed, and based on reliable, up-to-date sources.
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
