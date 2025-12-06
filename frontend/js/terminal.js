class Terminal {
    constructor() {
        this.input = document.getElementById('command-input');
        this.output = document.getElementById('output');
        this.terminalEl = document.querySelector('.crt-monitor');
        this.conversationHistory = [];
        
        this.gameManager = new GameManager(this);
        
        this.initEvents();
        this.printLine("GREETINGS PROFESSOR FALKEN.");
        this.printLine("");
        this.input.focus();
    }

    initEvents() {
        document.addEventListener('click', (e) => {
            // Don't focus if clicking on a game interactive element
            if (!e.target.classList.contains('cell') && !e.target.classList.contains('battleship-cell')) {
                this.input.focus();
            }
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value;
                if (command.trim() === '') return;
                this.sendMessage(command);
            }
        });
    }

    isInputDisabled() {
        return this.input.disabled;
    }

    printLine(text) {
        const line = document.createElement('div');
        line.textContent = text;
        this.output.appendChild(line);
        this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
    }

    typeWriter(text) {
        const line = document.createElement('div');
        this.output.appendChild(line);
        let i = 0;
        const speed = 30; 

        const type = () => {
            if (i < text.length) {
                line.textContent += text.charAt(i);
                i++;
                this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
                setTimeout(type, speed);
            } else {
                this.input.disabled = false;
                this.input.focus();
            }
        };
        type();
    }

    async sendMessage(message, print = true) {
        if (print) {
            this.printLine(`> ${message.toUpperCase()}`);
        }
        
        this.conversationHistory.push({ role: "user", content: message });
        this.input.value = '';
        this.input.disabled = true;

        try {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 500));
            
            // Get extra state from active game
            const gameState = this.gameManager.getGameState();
            
            const payload = { 
                history: this.conversationHistory,
                ...gameState
            };

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            const fullResponse = data.response;
            
            // Parse for hidden commands
            // Regex to find JSON block:
            // 1. Starts with ``` (optional json/JSON tag)
            // 2. Captures the content inside {}
            // 3. Ends with ```
            // Case insensitive (/i) and dotAll (s - though JS uses [\s\S] or s flag in newer browsers)
            const jsonMatch = fullResponse.match(/```(?:json)?\s*({[\s\S]*?})\s*```/i);
            let cleanResponse = fullResponse;
            
            if (jsonMatch) {
                try {
                    const command = JSON.parse(jsonMatch[1]);
                    cleanResponse = fullResponse.replace(jsonMatch[0], '').trim();
                    this.gameManager.handleCommand(command);
                } catch (e) {
                    console.error("Failed to parse game command", e);
                }
            } else {
                // Fallback: Try to find a raw JSON object if code blocks are missing
                // Look for {"game": ... } pattern
                const rawMatch = fullResponse.match(/({[\s\S]*?"game"[\s\S]*?})/);
                if (rawMatch) {
                    try {
                        const command = JSON.parse(rawMatch[1]);
                        // Only treat as command if it has the 'game' property
                        if (command.game) {
                            cleanResponse = fullResponse.replace(rawMatch[0], '').trim();
                            this.gameManager.handleCommand(command);
                        }
                    } catch (e) {
                        // Not valid JSON, ignore
                    }
                }
            }

            this.conversationHistory.push({ role: "assistant", content: fullResponse });
            
            if (cleanResponse) {
                this.typeWriter(cleanResponse.toUpperCase());
            } else {
                this.input.disabled = false;
                this.input.focus();
            }

        } catch (error) {
            this.printLine("CARRIER SIGNAL LOST.");
            console.error(error);
            this.input.disabled = false;
            this.input.focus();
        }
    }
}

// Initialize
window.onload = () => {
    new Terminal();
};
