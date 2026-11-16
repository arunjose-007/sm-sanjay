# Free Offline Local AI with Ollama

The **Intelligent Assistant for Livelihood and Road Safety** supports 100% offline, free, and open-source local Large Language Models via **Ollama**, along with cloud **xAI Grok API** integration.

- **100% Free & Private**: No API keys required for Ollama.
- **Fast Token Generation**: Pre-configured with low latency KV-cache (`num_ctx: 2048`, `num_predict: 512`) and `keep_alive: 20m` for instant responses.
- **Multi-Model Auto Switching**: Dynamic model selector supporting Llama 3.2, Qwen 2.5, DeepSeek R1, and Gemma.

---

## 1. Quick Verification

Ollama is installed on your system at:
```
C:\Users\sanja\AppData\Local\Programs\Ollama\ollama.exe
```

Verify your installation:
```powershell
ollama --version
```

Check all downloaded models:
```powershell
ollama list
```

---

## 2. Fast Recommended Local Models

The application is pre-configured with four ultra-fast, high-capability models:

| Model | Tag | Size | Best For | Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Meta Llama 3.2** | `llama3.2:3b` | ~2.0 GB | General reasoning, livelihood, safety | ⚡ Ultra-Fast |
| **Alibaba Qwen 2.5** | `qwen2.5:1.5b` | ~986 MB | Coding, math, multilingual & Tamil queries | 🚀 Instant |
| **DeepSeek R1** | `deepseek-r1:1.5b` | ~1.1 GB | Advanced step-by-step reasoning & calculations | 🧠 High Logic |
| **Google Gemma 2** | `gemma2:2b` | ~1.6 GB | Fast, balanced conversational QA | ⚡ Fast |

---

## 3. Pulling Models in Terminal

If you ever wish to re-pull or update models, run:

```powershell
# Meta Llama 3.2 (3B)
ollama pull llama3.2:3b

# Alibaba Qwen 2.5 (1.5B)
ollama pull qwen2.5:1.5b

# DeepSeek R1 (1.5B)
ollama pull deepseek-r1:1.5b

# Google Gemma 2 (2B)
ollama pull gemma2:2b
```

---

## 4. Starting the Background Service

Ollama runs locally as a Windows background service listening on:
```
http://localhost:11434
```

To start the Ollama application manually if not already running:
```powershell
Start-Process "C:\Users\sanja\AppData\Local\Programs\Ollama\ollama app.exe"
```

The Flask backend automatically discovers installed models from `http://localhost:11434/api/tags` and populates them into the **AI Assistant** model selector dropdown.
