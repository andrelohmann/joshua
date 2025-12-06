#!/bin/sh

# Start Ollama in the background.
/bin/ollama serve &
pid=$!

# Wait for Ollama to start.
sleep 5

echo "🔴 Retrieve model gpt-oss:20b..."
ollama pull gpt-oss:20b
echo "🟢 Done!"

# Wait for the process to finish.
wait $pid
