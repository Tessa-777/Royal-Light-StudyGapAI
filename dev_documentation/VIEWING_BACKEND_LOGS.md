# Viewing Backend Logs - Guide

## Where to See Backend Logs

Backend logs appear in the **terminal/console where Flask is running**.

### If Using `flask run`:
The logs will appear in the same terminal where you ran `flask run`.

### If Using `python -m flask run`:
The logs will appear in the same terminal where you ran the command.

### If Using a Script:
Check the terminal where the script is running.

## Log Configuration

The Flask app is now configured to show logs in the terminal with:
- **Timestamp**: `YYYY-MM-DD HH:MM:SS`
- **Log Level**: `INFO`, `WARNING`, `ERROR`, etc.
- **Logger Name**: Which module logged the message
- **Message**: The actual log message

## What Logs to Look For

When you submit a quiz, you should see these logs in order:

### 1. Quiz Submission Received
```
2025-11-09 11:56:00 [INFO] flask.app: 📋 Quiz submission received: is_guest=False, has_auth_header=True, current_user_id=170a99cb-...
2025-11-09 11:56:00 [INFO] flask.app: 👤 Authenticated user submitting quiz: 170a99cb-...
```

### 2. Quiz Creation
```
2025-11-09 11:56:01 [INFO] flask.app: Creating quiz for user 170a99cb-...: subject=Mathematics, total_questions=30, time_taken=45.5
2025-11-09 11:56:01 [INFO] flask.app: ✅ Created quiz for authenticated user: 1cc8c509-... (user_id: 170a99cb-...)
```

### 3. Quiz Responses Saved
```
2025-11-09 11:56:02 [INFO] flask.app: Saving 30 quiz responses for quiz 1cc8c509-...
2025-11-09 11:56:02 [INFO] flask.app: ✅ Saved 30 quiz responses for quiz 1cc8c509-...
```

### 4. Diagnostic Saved
```
2025-11-09 11:56:03 [INFO] flask.app: Saving diagnostic for quiz 1cc8c509-... (user: 170a99cb-...)
2025-11-09 11:56:03 [INFO] flask.app: ✅ Saved diagnostic to database: 1c2acd35-... (quiz_id: 1cc8c509-..., user: 170a99cb-...)
```

### 5. Success Response
```
2025-11-09 11:56:04 [INFO] flask.app: ✅✅✅ SUCCESS: Authenticated diagnostic generated and saved ✅✅✅
2025-11-09 11:56:04 [INFO] flask.app:    - Diagnostic ID: 1c2acd35-...
2025-11-09 11:56:04 [INFO] flask.app:    - Quiz ID: 1cc8c509-...
2025-11-09 11:56:04 [INFO] flask.app:    - User ID: 170a99cb-...
```

## Troubleshooting: No Logs Appearing

### Issue 1: Flask Not Running in Terminal
**Solution**: Make sure Flask is running in a terminal window, not as a background process.

### Issue 2: Logs Going to a File
**Solution**: Check if there's a log file (e.g., `app.log`, `flask.log`) in the project directory.

### Issue 3: Log Level Too High
**Solution**: The app is now configured to show INFO level logs. If you still don't see logs, check:
- Is `FLASK_ENV=development` in your `.env` file?
- Is `DEBUG=True` in Flask config?

### Issue 4: Flask Running in Different Terminal
**Solution**: Check all terminal windows - Flask might be running in a different terminal than you're looking at.

## How to Run Flask with Visible Logs

### Option 1: Using `flask run` (Recommended)
```bash
# Make sure you're in the project root directory
cd C:\Users\ingex\OneDrive\Documents\asdf\Royal-Light-StudyGapAI

# Activate virtual environment (if using one)
# On Windows:
venv\Scripts\activate

# Run Flask
flask run

# Or with explicit host and port:
flask run --host=0.0.0.0 --port=5000
```

### Option 2: Using `python -m flask run`
```bash
python -m flask run
```

### Option 3: Using Python directly
```bash
python -m backend.app
```

## Verifying Logs Are Working

1. **Start Flask server** in a terminal
2. **Look for initialization logs**:
   ```
   ============================================================
   Flask app logger configured - logs will appear in terminal
   Debug mode: True, Log level: INFO
   ============================================================
   ```

3. **Make a test request** (e.g., `GET /health`)
4. **Check terminal for logs** - you should see:
   ```
   2025-11-09 11:56:00 [INFO] werkzeug: 127.0.0.1 - - [09/Nov/2025 11:56:00] "GET /health HTTP/1.1" 200 -
   ```

## Finding the Flask Terminal

If you're not sure which terminal Flask is running in:

1. **Check all open terminal windows**
2. **Look for output like**:
   ```
   * Running on http://127.0.0.1:5000
   * Running on http://0.0.0.0:5000
   ```
3. **That's the terminal with Flask logs**

## Next Steps

1. **Restart Flask server** to apply logging configuration
2. **Take a new quiz** and watch the terminal for logs
3. **Share the logs** if quizzes still aren't being saved

