class BattleshipGame {
    constructor(terminal) {
        this.terminal = terminal;
        this.container = document.getElementById('battleship-board');
        this.userGrid = document.getElementById('battleship-user-grid');
        this.aiGrid = document.getElementById('battleship-ai-grid');
        this.isActive = false;
        
        this.ships = [5, 4, 3, 3, 2];
        this.userShips = []; // Array of sets of coordinates
        this.aiShips = [];
        this.aiShots = []; // Track AI shots for backend context
        
        this.initGrids();
    }

    initGrids() {
        // Create 10x10 grids
        for (let i = 0; i < 100; i++) {
            const userCell = document.createElement('div');
            userCell.className = 'battleship-cell';
            userCell.dataset.index = i;
            this.userGrid.appendChild(userCell);

            const aiCell = document.createElement('div');
            aiCell.className = 'battleship-cell';
            aiCell.dataset.index = i;
            aiCell.addEventListener('click', () => this.handleAiGridClick(i));
            this.aiGrid.appendChild(aiCell);
        }
    }

    start() {
        this.isActive = true;
        this.container.style.display = 'flex';
        this.resetBoard();
        this.placeShips(this.userShips, true); // Place User Ships (Visible)
        this.placeShips(this.aiShips, false);  // Place AI Ships (Hidden)
        this.terminal.printLine("GAME STARTED: BATTLESHIP");
        this.terminal.printLine("DEPLOYING FLEET...");
        this.terminal.printLine("SENSORS ACTIVE. AWAITING ORDERS.");
    }

    end(message) {
        this.isActive = false;
        this.terminal.printLine(message);
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 5000);
    }

    resetBoard() {
        document.querySelectorAll('.battleship-cell').forEach(c => {
            c.className = 'battleship-cell';
            c.textContent = '';
        });
        this.userShips = [];
        this.aiShips = [];
        this.aiShots = [];
    }

    placeShips(shipArray, isVisible) {
        const grid = isVisible ? this.userGrid : this.aiGrid;
        
        this.ships.forEach(length => {
            let placed = false;
            while (!placed) {
                const horizontal = Math.random() < 0.5;
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                
                if (this.canPlace(shipArray, row, col, length, horizontal)) {
                    const newShip = new Set();
                    for (let i = 0; i < length; i++) {
                        const r = horizontal ? row : row + i;
                        const c = horizontal ? col + i : col;
                        const idx = r * 10 + c;
                        newShip.add(idx);
                        
                        if (isVisible) {
                            grid.children[idx].classList.add('ship');
                        }
                    }
                    shipArray.push(newShip);
                    placed = true;
                }
            }
        });
    }

    canPlace(shipArray, row, col, length, horizontal) {
        for (let i = 0; i < length; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            if (r >= 10 || c >= 10) return false;
            
            const idx = r * 10 + c;
            // Check overlap
            for (const ship of shipArray) {
                if (ship.has(idx)) return false;
            }
        }
        return true;
    }

    handleAiGridClick(index) {
        if (!this.isActive || this.terminal.isInputDisabled()) return;
        const cell = this.aiGrid.children[index];
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        // Determine Hit/Miss
        let result = 'MISS';
        let hitShip = null;
        
        for (const ship of this.aiShips) {
            if (ship.has(index)) {
                result = 'HIT';
                hitShip = ship;
                break;
            }
        }

        if (result === 'HIT') {
            cell.classList.add('hit');
            cell.textContent = 'X';
            // Check sunk
            if (this.isSunk(hitShip, this.aiGrid)) {
                result = 'SUNK';
                this.terminal.printLine("TARGET DESTROYED!");
            }
        } else {
            cell.classList.add('miss');
            cell.textContent = '•';
        }

        // Convert index to A1 format
        const col = String.fromCharCode(65 + (index % 10));
        const row = Math.floor(index / 10) + 1;
        const coord = `${col}${row}`;

        // Send to backend
        this.terminal.sendMessage(`[USER_SHOT: ${coord}, RESULT: ${result}]`, false);
        
        // Check Win
        if (this.checkWin(this.aiShips, this.aiGrid)) {
            this.terminal.sendMessage('[SYSTEM: GAME_OVER_USER_WINS]', false);
        }
    }

    handleCommand(command) {
        if (command.action === 'start') {
            this.start();
        } else if (command.action === 'fire') {
            this.handleAiFire(command.target);
        } else if (command.action === 'end') {
            this.end(command.message || "GAME OVER");
        }
    }

    handleAiFire(target) {
        // Target is like "A1"
        if (!target || target.length < 2) return;
        
        const colChar = target.charAt(0).toUpperCase();
        const rowStr = target.substring(1);
        
        const col = colChar.charCodeAt(0) - 65;
        const row = parseInt(rowStr) - 1;
        
        if (col < 0 || col > 9 || row < 0 || row > 9) return;
        
        const index = row * 10 + col;
        const cell = this.userGrid.children[index];
        
        let result = 'MISS';
        let hitShip = null;
        
        for (const ship of this.userShips) {
            if (ship.has(index)) {
                result = 'HIT';
                hitShip = ship;
                break;
            }
        }

        if (result === 'HIT') {
            cell.classList.add('hit');
            cell.textContent = 'X';
            if (this.isSunk(hitShip, this.userGrid)) {
                result = 'SUNK';
                this.terminal.printLine("OUR SHIP HAS BEEN DESTROYED!");
            } else {
                this.terminal.printLine("WE HAVE BEEN HIT!");
            }
        } else {
            cell.classList.add('miss');
            cell.textContent = '•';
            this.terminal.printLine("ENEMY MISSED.");
        }
        
        // Record shot for backend context
        this.aiShots.push({ target: target, result: result });

        // Check Loss
        if (this.checkWin(this.userShips, this.userGrid)) {
             // AI Wins
             // The backend usually declares this via 'end', but we can trigger it too
             // But let's just let the game continue until backend sends 'end' or we send a system message
             // Actually, if AI wins, we should tell it.
             this.terminal.sendMessage(`[AI_LAST_SHOT_RESULT: ${result}] [SYSTEM: GAME_OVER_AI_WINS]`, false);
        } else {
             // Just report result
             // We need to send this as a hidden message so the AI knows what happened
             // But wait, the user is supposed to reply?
             // The protocol says: "The user will report their shot... AND the result of YOUR last shot."
             // So we store this result and send it with the NEXT user move?
             // No, that delays the AI knowing.
             // Better: Send a system update immediately?
             // Or just append it to the history.
             // Let's send a hidden system update.
             this.terminal.sendMessage(`[AI_LAST_SHOT_RESULT: ${result}]`, false);
        }
    }

    isSunk(ship, gridElement) {
        for (const idx of ship) {
            if (!gridElement.children[idx].classList.contains('hit')) {
                return false;
            }
        }
        return true;
    }

    checkWin(ships, gridElement) {
        for (const ship of ships) {
            if (!this.isSunk(ship, gridElement)) return false;
        }
        return true;
    }

    getGameState() {
        if (!this.isActive) return {};
        return {
            battleshipAiShots: this.aiShots
        };
    }
}
