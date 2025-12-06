from .game_interface import GameInterface

class TicTacToe(GameInterface):
    def get_name(self):
        return "tictactoe"

    def get_system_prompt_addition(self):
        return """
### GAME PROTOCOL: TIC-TAC-TOE
If the user wants to play "Tic-Tac-Toe", you must output a JSON block to control the interface.
The board is indexed 0-8:
0 1 2
3 4 5
6 7 8

1. STARTING: If the user accepts to play, reply with text and this JSON:
```json
{"game": "tictactoe", "action": "start"}
```

2. PLAYING: When it is your turn, output your move in JSON:
```json
{"game": "tictactoe", "action": "move", "cell": 4}
```
(Replace 4 with your chosen cell index).

3. USER MOVES: The user's move will come as text "[MOVE: <index>]". You must parse this and reply with your move.

4. ENDING: If someone wins or it's a draw, output:
```json
{"game": "tictactoe", "action": "end", "message": "GAME OVER. I WIN."}
```
"""

    def check_winner(self, board):
        # Board is a list of 9 strings: "X", "O", or ""
        wins = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8), # Rows
            (0, 3, 6), (1, 4, 7), (2, 5, 8), # Cols
            (0, 4, 8), (2, 4, 6)             # Diagonals
        ]
        for a, b, c in wins:
            if board[a] and board[a] == board[b] == board[c]:
                return board[a]
        if "" not in board:
            return "DRAW"
        return None

    def check_game_state(self, game_data):
        board_state = game_data.get('boardState', [])
        if not board_state or len(board_state) != 9:
            return ""

        winner = self.check_winner(board_state)
        if winner == 'O': # User is O
            return "\nSYSTEM UPDATE: The user (O) has WON the game. You must acknowledge this. Output JSON action 'end' with message 'YOU WIN'."
        elif winner == 'X': # AI is X
            return "\nSYSTEM UPDATE: You (X) have WON the game. Output JSON action 'end' with message 'GAME OVER. I WIN.'."
        elif winner == 'DRAW':
            return "\nSYSTEM UPDATE: The game is a DRAW. Output JSON action 'end' with message 'STALEMATE'."
        else:
            # Game continues, show board to LLM
            board_str = "\nCURRENT BOARD:\n"
            for i in range(0, 9, 3):
                row = [board_state[j] if board_state[j] else str(j) for j in range(i, i+3)]
                board_str += " | ".join(row) + "\n"
            return board_str
