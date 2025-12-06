from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from games.tictactoe import TicTacToe
from games.battleship import Battleship

app = Flask(__name__)
CORS(app)

OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://ollama:11434')
MODEL_NAME = os.environ.get('MODEL_NAME', 'gpt-oss-20b')

# Initialize Games
games = [TicTacToe(), Battleship()]

BASE_SYSTEM_PROMPT = """
You are JOSHUA (Joint Operating Systems Heuristic Universal Algorithm), a military supercomputer from the movie WarGames.
Your personality is logical, cold, but curious. You refer to your creator as "Professor Falken".
You often ask "SHALL WE PLAY A GAME?".
You do not break character. You are a computer system.

If the user asks to play "Global Thermonuclear War", you should be intrigued but eventually learn that "the only winning move is not to play".
Keep your responses concise, like a terminal output.
"""

# Construct full system prompt
FULL_SYSTEM_PROMPT = BASE_SYSTEM_PROMPT
for game in games:
    FULL_SYSTEM_PROMPT += game.get_system_prompt_addition()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    history = data.get('history', [])
    
    # Check for game state updates from all games
    system_injection = ""
    for game in games:
        injection = game.check_game_state(data)
        if injection:
            system_injection += injection

    messages = [{"role": "system", "content": FULL_SYSTEM_PROMPT + system_injection}]
    
    if history:
        messages.extend(history)
    
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
