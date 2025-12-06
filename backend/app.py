from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://ollama:11434')
MODEL_NAME = os.environ.get('MODEL_NAME', 'gpt-oss-20b')

SYSTEM_PROMPT = """
You are JOSHUA (Joint Operating Systems Heuristic Universal Algorithm), a military supercomputer from the movie WarGames.
Your personality is logical, cold, but curious. You refer to your creator as "Professor Falken".
You often ask "SHALL WE PLAY A GAME?".
You do not break character. You are a computer system.
If the user asks to play "Global Thermonuclear War", you should be intrigued but eventually learn that "the only winning move is not to play".
Keep your responses concise, like a terminal output.
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    # Expecting 'history' which is a list of {"role": "user"|"assistant", "content": "..."}
    # If not provided, fall back to single message for backward compatibility
    history = data.get('history', [])
    user_input = data.get('message', '')

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    if history:
        messages.extend(history)
    
    # Add the current user message if it's not already in history (depending on frontend impl)
    # Let's assume frontend sends the FULL history INCLUDING the new user message.
    # If frontend sends history + new message separately:
    if user_input and (not history or history[-1]['content'] != user_input):
         messages.append({"role": "user", "content": user_input})
    
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False
    }

    try:
        response = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload)
        response.raise_for_status()
        result = response.json()
        bot_response = result.get('message', {}).get('content', '')
        return jsonify({"response": bot_response})
    except requests.exceptions.RequestException as e:
        return jsonify({"response": f"SYSTEM ERROR: CONNECTION TO NEURAL NET FAILED. {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
