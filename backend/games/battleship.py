from .game_interface import GameInterface

class Battleship(GameInterface):
    def get_name(self):
        return "battleship"

    def get_system_prompt_addition(self):
        return """
### GAME PROTOCOL: BATTLESHIP
If the user wants to play "Battleship", use this protocol.
The board is 10x10, columns A-J, rows 1-10.

1. STARTING:
```json
{"game": "battleship", "action": "start"}
```

2. PLAYING (AI TURN):
When it is your turn to fire, output:
```json
{"game": "battleship", "action": "fire", "target": "A1"}
```
(Replace A1 with your target coordinate).

3. USER MOVES & RESULTS:
The user will report their shot and the result, AND the result of YOUR last shot.
Format: `[USER_SHOT: <coord>, RESULT: <HIT/MISS/SUNK>] [AI_LAST_SHOT_RESULT: <HIT/MISS/SUNK>]`
You should use this information to plan your next shot.
If you hit a ship, try adjacent coordinates.

4. ENDING:
If all ships are sunk:
```json
{"game": "battleship", "action": "end", "message": "GAME OVER."}
```
"""

    def check_game_state(self, game_data):
        # For Battleship, the state is mostly managed by the frontend and passed via text history/context.
        # However, we can inject the "AI's Target Board" if the frontend sends it.
        
        ai_shots = game_data.get('battleshipAiShots', []) # List of {"target": "A1", "result": "HIT"}
        
        if not ai_shots:
            return ""

        # Construct a simple visual representation of what the AI knows about the user's board
        # This helps the LLM visualize where it has fired.
        board_visual = "\nYOUR TARGETING MAP (Where you have fired at User):\n  A B C D E F G H I J\n"
        grid = [['.' for _ in range(10)] for _ in range(10)]
        
        for shot in ai_shots:
            target = shot.get('target', '')
            result = shot.get('result', '')
            if len(target) >= 2:
                col_idx = ord(target[0].upper()) - ord('A')
                try:
                    row_idx = int(target[1:]) - 1
                    if 0 <= col_idx < 10 and 0 <= row_idx < 10:
                        char = 'M' if result == 'MISS' else 'H'
                        if result == 'SUNK': char = 'X'
                        grid[row_idx][col_idx] = char
                except:
                    pass

        for i, row in enumerate(grid):
            board_visual += f"{i+1:<2}" + " ".join(row) + "\n"
            
        return board_visual
