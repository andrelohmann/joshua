# JOSHUA - WarGames Simulator

A retro-styled terminal simulator inspired by the 1983 movie "WarGames". This project recreates the interface of the IMSAI 8080 computer and connects it to a modern AI backend (Ollama) running the "JOSHUA" persona.

## 🖥️ Features

*   **Retro Interface**: Authentic IMSAI 8080 terminal look with green phosphor text, scanlines, and blinking cursor.
*   **AI-Powered**: Integrated with **Ollama** to run large language models locally.
*   **JOSHUA Persona**: The AI is prompted to act as the WOPR (War Operation Plan Response) supercomputer.
*   **Conversation History**: Maintains context for a continuous dialogue.
*   **Dockerized**: Fully containerized setup using Docker Compose for easy deployment.
*   **GPU Support**: Configured to utilize NVIDIA GPUs for faster AI inference.
*   **Auto-Model Management**: Automatically downloads and persists the required LLM model.

## 🚀 Prerequisites

*   **Docker** & **Docker Compose**
*   **NVIDIA GPU** (Recommended) with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) installed for GPU acceleration.
*   *Note: The project can run on CPU, but response times will be significantly slower.*

## 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd JOSHUA
    ```

2.  **Start the Simulation**
    Run the following command to build and start the containers:
    ```bash
    docker compose up --build
    ```

3.  **Wait for Initialization**
    *   On the first run, the system will automatically download the configured model (default: `gpt-oss:20b`).
    *   Watch the terminal logs. The backend will be ready once the model is pulled and the server is listening on port 5000.

## 🎮 How to Play

1.  Open your web browser and navigate to:
    **http://localhost:8080**

2.  You will be greeted with:
    `GREETINGS PROFESSOR FALKEN.`

3.  Type your response and press **ENTER**.
    *   *Try asking: "SHALL WE PLAY A GAME?"*
    *   *Try listing games: "LIST GAMES"*
    *   *Try the forbidden game: "GLOBAL THERMONUCLEAR WAR"*

## 📂 Project Structure

```
JOSHUA/
├── backend/            # Flask API handling AI logic
│   ├── app.py          # Main application code
│   └── Dockerfile      # Backend container definition
├── frontend/           # Web-based terminal interface
│   ├── index.html      # Main UI structure
│   ├── style.css       # Retro styling (CRT effects)
│   ├── script.js       # Terminal logic & API communication
│   └── Dockerfile      # Nginx container definition
├── scripts/            # Helper scripts
│   └── start-ollama.sh # Startup script for Ollama model management
├── .models/            # Local storage for Ollama models (persisted)
└── docker-compose.yml  # Orchestration for all services
```

## ⚙️ Configuration

You can customize the simulation by editing `docker-compose.yml` or `backend/app.py`.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MODEL_NAME` | The Ollama model tag to use. | `gpt-oss:20b` |
| `OLLAMA_HOST` | Internal URL for the Ollama service. | `http://ollama:11434` |

## ⚠️ Troubleshooting

*   **"CARRIER SIGNAL LOST"**: The frontend cannot reach the backend. This usually happens if the backend is still starting up or if the model is currently downloading. Wait a few moments and try again.
*   **Slow Responses**: Ensure Docker has access to your GPU. Check `docker compose logs ollama` to see if it initialized with CUDA support.

---
*"The only winning move is not to play."*
