const input = document.getElementById('command-input');
const output = document.getElementById('output');
const terminal = document.querySelector('.crt-monitor');

let conversationHistory = [];

// Initial greeting
window.onload = () => {
    printLine("GREETINGS PROFESSOR FALKEN.");
    printLine("");
    input.focus();
};

// Keep focus on input
document.addEventListener('click', () => {
    input.focus();
});

input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        if (command.trim() === '') return;

        printLine(`> ${command.toUpperCase()}`);
        
        // Add user message to history
        conversationHistory.push({ role: "user", content: command });

        input.value = '';
        input.disabled = true; // Disable input while processing

        try {
            // Simulate network delay/processing
            await new Promise(r => setTimeout(r, 500));
            
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ history: conversationHistory })
            });

            const data = await response.json();
            const botResponse = data.response;
            
            // Add assistant response to history
            conversationHistory.push({ role: "assistant", content: botResponse });
            
            typeWriter(botResponse.toUpperCase());
        } catch (error) {
            printLine("CARRIER SIGNAL LOST.");
            console.error(error);
            input.disabled = false;
            input.focus();
        }
    }
});

function printLine(text) {
    const line = document.createElement('div');
    line.textContent = text;
    output.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function typeWriter(text) {
    const line = document.createElement('div');
    output.appendChild(line);
    let i = 0;
    const speed = 50; // Typing speed in ms

    function type() {
        if (i < text.length) {
            line.textContent += text.charAt(i);
            i++;
            terminal.scrollTop = terminal.scrollHeight;
            setTimeout(type, speed);
        } else {
            input.disabled = false;
            input.focus();
        }
    }
    type();
}
