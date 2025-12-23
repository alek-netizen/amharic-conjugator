# Visitor Counter Setup

This project now includes a visitor counter that tracks the number of unique visitors to the website.

## How It Works

1. **Backend API** (`visitor_counter.py`): A Flask server that stores and increments visitor counts
2. **Frontend**: JavaScript code that tracks new visits and displays the count in the header
3. **Storage**: Visitor count is stored in `visitor_count.json`

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the visitor counter API:**
   ```bash
   python visitor_counter.py
   ```
   The API will run on `http://127.0.0.1:5000`

3. **Open the website:**
   - Open `index.html` in your web browser
   - The visitor counter will appear in the header showing the current count

## API Endpoints

- `GET /api/visitors` - Get the current visitor count
- `POST /api/visitors/increment` - Increment the visitor count (called automatically by the frontend)

## How Visitor Tracking Works

- Uses `sessionStorage` to track if a visitor has already been counted in the current browser session
- Each new session (per day) increments the counter
- The count is displayed in the header with a visitor icon
- The count persists in `visitor_count.json` even after the server restarts

## Notes

- The counter tracks unique sessions per day (one visit per browser per day)
- The API must be running for the counter to work
- If the API is not available, the counter will show "?" instead of a number

