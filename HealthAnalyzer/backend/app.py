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
import json

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

Additionally:

5. Include an "allergen_additive_warnings" field:
   - A list of any potential allergens (e.g., milk, soy, gluten) or additives (e.g., colorants, preservatives) if mentioned or implied.
   - If none are found, use ["None"].

6. Include a "product_summary" field:
   - A single-sentence summary that briefly describes the nature and safety of the product.

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
  },
  "allergen_additive_warnings": ["list of allergens or additives, or ['None']"],
  "product_summary": "string - One sentence describing the product's general purpose and safety"
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
  },
  "allergen_additive_warnings": ["Milk", "Artificial Flavoring Substances", "Caramel Color"],
  "product_summary": "A chocolate malt drink mix with mostly nutritious ingredients, though high in sugar and includes additives."
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


@app.route("/api/alternatives", methods=["POST"])
def get_product_alternatives():
    logger.info("Get product alternatives endpoint called")
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

    # Get the analysis data from request
    data = request.get_json()
    if not data or "analysis_data" not in data:
        logger.warning("No analysis data provided in request")
        return jsonify({"error": "No analysis data provided"}), 400

    analysis_data = data["analysis_data"]
    logger.info(f"Processing alternatives request for product: {analysis_data.get('product_name', 'Unknown')}")

    # Prepare Perplexity API request for alternatives
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {perplexity_api_key}",
        "accept": "application/json",
        "content-type": "application/json",
    }

    prompt = f"""
Based on the following product analysis, recommend 3-5 healthier alternatives that are available in the market. Focus on products that address the specific health concerns identified in the original product.

Original Product Analysis:
- Product Name: {analysis_data.get('product_name', 'Unknown Product')}
- Safety Score: {analysis_data.get('safety_score', 'N/A')}
- Summary: {analysis_data.get('ingredients_summary', '')}
- Not Great Ingredients: {', '.join(analysis_data.get('ingredient_categories', {}).get('not_great', {}).get('ingredients', []))}
- Dangerous Ingredients: {', '.join(analysis_data.get('ingredient_categories', {}).get('dangerous', {}).get('ingredients', []))}
- Allergen Warnings: {', '.join(analysis_data.get('allergen_additive_warnings', []))}

Your response MUST be a valid JSON object with no additional formatting or markdown. Return ONLY the JSON object.

Use this exact JSON structure:

{{
  "alternatives": [
    {{
      "product_name": "string - Name of the alternative product",
      "brand": "string - Brand name",
      "why_better": "string - 2-3 sentence explanation of why this is better",
      "key_improvements": ["array of 2-4 key improvements over the original"],
      "safety_score": "string - estimated safety score like 'Safe: 98%'",
      "price_range": "string - rough price range like '$3-5' or 'Similar pricing'",
      "availability": "string - where to find it like 'Major grocery stores' or 'Health food stores'",
      "main_benefits": ["array of 2-3 main health benefits"],
      "purchase_links": {{
        "amazon": "https://amazon.com/s?k=product+name+brand",
        "walmart": "https://walmart.com/search?q=product+name+brand", 
        "target": "https://target.com/s/product+name",
        "instacart": "https://instacart.com/store/search/product+name"
      }}
    }}
  ],
  "general_advice": {{
    "avoid_ingredients": ["list of ingredients to avoid when shopping"],
    "look_for_ingredients": ["list of ingredients to look for instead"],
    "shopping_tips": ["2-3 practical shopping tips"]
  }}
}}

Example response:

{{
  "alternatives": [
    {{
      "product_name": "Organic Cocoa Powder (Unsweetened)",
      "brand": "Navitas Organics",
      "why_better": "Contains pure cocoa without added sugars, artificial flavors, or preservatives. You can control sweetness by adding natural sweeteners like honey or maple syrup.",
      "key_improvements": ["No added sugar", "No artificial ingredients", "Higher antioxidant content", "Customizable sweetness"],
      "safety_score": "Safe: 98%",
      "price_range": "$8-12",
      "availability": "Health food stores, online",
      "main_benefits": ["Rich in antioxidants", "No sugar crash", "Pure nutrition"],
      "purchase_links": {{
        "amazon": "https://amazon.com/s?k=navitas+organics+cocoa+powder",
        "walmart": "https://walmart.com/search?q=organic+cocoa+powder+navitas",
        "target": "https://target.com/s/organic+cocoa+powder",
        "instacart": "https://instacart.com/store/search/organic+cocoa+powder"
      }}
    }},
    {{
      "product_name": "Simply Organic Pure Vanilla Extract",
      "brand": "Simply Organic", 
      "why_better": "Made with organic vanilla beans and organic alcohol, no artificial flavors or corn syrup. Perfect for making homemade chocolate drinks.",
      "key_improvements": ["Organic ingredients", "No artificial flavors", "No corn syrup", "Pure vanilla"],
      "safety_score": "Safe: 99%",
      "price_range": "$6-8",
      "availability": "Grocery stores, health food stores",
      "main_benefits": ["Pure organic flavor", "No synthetic additives", "Supports organic farming"],
      "purchase_links": {{
        "amazon": "https://amazon.com/s?k=simply+organic+vanilla+extract",
        "walmart": "https://walmart.com/search?q=simply+organic+vanilla",
        "target": "https://target.com/s/simply+organic+vanilla",
        "instacart": "https://instacart.com/store/search/simply+organic+vanilla"
      }}
    }}
  ],
  "general_advice": {{
    "avoid_ingredients": ["High fructose corn syrup", "Artificial colors", "Excessive added sugar", "Preservatives like BHT/BHA"],
    "look_for_ingredients": ["Organic cocoa", "Natural sweeteners", "Real vanilla extract", "Minimal ingredient lists"],
    "shopping_tips": ["Read labels carefully", "Choose organic when possible", "Consider making drinks at home for better control"]
  }}
}}

Focus on realistic, widely available alternatives that specifically address the health concerns from the original product analysis. Include realistic search-friendly purchase links for major retailers.
"""

    payload = {
        "model": "sonar", 
        "messages": [
            {"role": "system", "content": "You are a nutrition expert providing healthier product alternatives. Be practical and specific."},
            {"role": "user", "content": prompt}
        ],
        "web_search_options": {"search_context_size": "high"},
    }

    try:
        logger.info("Calling Perplexity API for alternatives")
        # Call Perplexity API
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        perplexity_data = response.json()
        logger.info("Perplexity API call for alternatives successful")

        # Extract the alternatives content
        alternatives_content = perplexity_data.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Parse the JSON response
        try:
            # Extract JSON from the response
            json_match = alternatives_content.strip()
            if json_match.startswith('```json'):
                json_match = json_match[7:-3]  # Remove ```json and ```
            elif json_match.startswith('```'):
                json_match = json_match[3:-3]  # Remove ``` and ```
            
            alternatives_data = json.loads(json_match)
            
            # Store alternatives request in Firestore for future reference
            logger.info("Storing alternatives data in Firestore")
            alternatives_request_data = {
                "user_id": user_id,
                "original_product": analysis_data.get('product_name', 'Unknown'),
                "alternatives_result": alternatives_data,
                "original_analysis": analysis_data,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }

            db.collection("alternatives_requests").add(alternatives_request_data)
            logger.info("Alternatives data stored successfully")

            return jsonify({
                "alternatives": alternatives_data,
                "citations": perplexity_data.get("citations", [])
            }), 200
            
        except json.JSONDecodeError as parse_error:
            logger.error(f"Failed to parse alternatives JSON: {parse_error}")
            logger.error(f"Raw content: {alternatives_content}")
            return jsonify({"error": "Failed to parse alternatives response"}), 500

    except Exception as e:
        logger.error(f"Alternatives error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Alternatives error: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask app on port {port}")
    app.run(debug=True, host="0.0.0.0", port=port)
