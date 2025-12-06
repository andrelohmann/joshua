class TicTacToeGame {
    constructor(terminal) {
        this.terminal = terminal;
        this.board = document.getElementById('tictactoe-board');
        this.cells = document.querySelectorAll('.tictactoe-board .cell');
        this.isActive = false;
        
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
    }

    start() {
        this.isActive = true;
        this.board.style.display = 'grid';
        this.cells.forEach(cell => cell.textContent = '');
        this.terminal.printLine("GAME STARTED: TIC-TAC-TOE");
    }

    end(message) {
        this.isActive = false;
        this.terminal.printLine(message);
        setTimeout(() => {
            this.board.style.display = 'none';
        }, 3000);
    }

    handleCellClick(cell) {
        if (!this.isActive || this.terminal.isInputDisabled()) return;
        if (cell.textContent !== '') return;

        const index = cell.dataset.index;
        this.makeMove(index, 'O');
        
        // Send move to backend
        this.terminal.sendMessage(`[MOVE: ${index}]`, false);
    }

    makeMove(index, player) {
        const cell = document.querySelector(`.tictactoe-board .cell[data-index="${index}"]`);
        if (cell) cell.textContent = player;
    }

    handleCommand(command) {
        if (command.action === 'start') {
            this.start();
        } else if (command.action === 'move') {
            this.makeMove(command.cell, 'X');
            if (this.checkLocalWinner() === 'X') {
                this.terminal.sendMessage('[SYSTEM: GAME_OVER_AI_WINS]', false);
            }
        } else if (command.action === 'end') {
            this.end(command.message || "GAME OVER");
        }
    }

    checkLocalWinner() {
        const boardState = Array.from(this.cells).map(cell => cell.textContent);
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let [a, b, c] of wins) {
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return boardState[a];
            }
        }
        return null;
    }

    getGameState() {
        if (!this.isActive) return {};
        return {
            boardState: Array.from(this.cells).map(cell => cell.textContent)
        };
    }
}
