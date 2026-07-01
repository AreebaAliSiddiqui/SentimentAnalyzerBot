try:
    import ollama
    _OLLAMA_AVAILABLE = True
except Exception:
    ollama = None
    _OLLAMA_AVAILABLE = False


def generate_response(user_message):
    """Generate a chatbot response using Ollama when available.

    Falls back to a simple echo message if Ollama or the model is unavailable.
    """
    if _OLLAMA_AVAILABLE:
        try:
            response = ollama.chat(
                model="mistral",
                messages=[
                    {"role": "system", "content": "You are a friendly and emotionally intelligent chatbot."},
                    {"role": "user", "content": user_message},
                ],
            )

            # 1. Check if it's a newer Ollama object with attributes
            if hasattr(response, 'message') and hasattr(response.message, 'content'):
                return response.message.content

            # 2. Fallback check if it's an older dictionary format
            if isinstance(response, dict):
                return (
                    response.get("message", {}).get("content")
                    or response.get("content")
                    or str(response)
                )
            
            # 3. Catch-all fallback
            return str(response)
            
        except Exception:
            # fall through to fallback
            pass

    # Fallback response when Ollama is not available or fails
    return "Sorry — I can't access the response model right now. I heard: " + user_message