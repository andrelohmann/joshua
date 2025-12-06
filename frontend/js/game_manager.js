class GameManager {
    constructor(terminal) {
        this.terminal = terminal;
        this.games = {
            'tictactoe': new TicTacToeGame(terminal),
            'battleship': new BattleshipGame(terminal)
        };
        this.activeGame = null;
    }

    handleCommand(command) {
        if (!command || !command.game) return;
        
        const game = this.games[command.game];
        if (game) {
            if (command.action === 'start') {
                if (this.activeGame && this.activeGame !== game) {
                    this.activeGame.end("SWITCHING GAMES...");
                }
                this.activeGame = game;
            }
            game.handleCommand(command);
        }
    }

    getGameState() {
        if (this.activeGame) {
            return this.activeGame.getGameState();
        }
        return {};
    }
}
