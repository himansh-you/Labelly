import os
import base64
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(dotenv_path='env.example')

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
print(supabase_url)
print(supabase_key)
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Perplexity API key
perplexity_api_key = os.environ.get("PERPLEXITY_API_KEY")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_ingredients():
    # Check if user is authenticated
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get JWT token
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token with Supabase (this is simplified, proper JWT verification needed)
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 401
    
    # Process the image
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    # Encode image to base64
    image_data = image_file.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")
    image_data_uri = f"data:image/jpeg;base64,{base64_image}"
    
    # Prepare Perplexity API request
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {perplexity_api_key}",
        "accept": "application/json",
        "content-type": "application/json"
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
                    {"type": "image_url", "image_url": {"url": image_data_uri}}
                ]
            },
        ],
        "web_search_options": {
            "search_context_size": "medium"
        }
    }
    
    try:
        # Call Perplexity API
        response = requests.post(url, headers=headers, json=payload)
        perplexity_data = response.json()
        
        # Store scan in Supabase
        scan_data = {
            "user_id": user_id,
            "analysis_result": perplexity_data,
            "timestamp": "now()"
        }
        
        # Insert scan data into Supabase
        supabase.table("scans").insert(scan_data).execute()
        
        # Return the analysis to the client
        return jsonify({
            "analysis": perplexity_data.get("choices", [{}])[0].get("message", {}).get("content", "No analysis available"),
            "citations": perplexity_data.get("citations", [])
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500

@app.route('/api/user/scans', methods=['GET'])
def get_user_scans():
    # Check if user is authenticated
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get JWT token
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        
        # Get user scans from Supabase
        scans_response = supabase.table("scans").select("*").eq("user_id", user_id).order("timestamp", desc=True).execute()
        
        return jsonify({"scans": scans_response.data}), 200
    
    except Exception as e:
        return jsonify({"error": f"Error retrieving scans: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))     