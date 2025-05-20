# Ingredients Health Analyzer - Backend

This is the Flask backend for the Ingredients Health Analyzer app, which analyzes product ingredients using Perplexity's Sonar API.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - macOS/Linux:
   ```bash
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

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/analyze` - Analyze ingredients from an image
- `GET /api/user/scans` - Get user's scan history

## Supabase Setup

The app uses Supabase for authentication and data storage. You'll need to:

1. Create a Supabase project at https://supabase.com
2. Create a `scans` table with the following schema:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `analysis_result` (jsonb)
   - `timestamp` (timestamp with time zone)
3. Set up row-level security policies for the `scans` table
4. Get your API URL and key from the Supabase dashboard 