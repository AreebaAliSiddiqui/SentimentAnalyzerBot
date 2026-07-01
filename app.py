from flask import Flask, render_template, request, jsonify
from sentiment import analyze_sentiment
from responses import generate_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]
    
    # 1. ADD THIS LINE HERE TO SEE IT INSTANTLY IN THE TERMINAL
    print(f"\n[SERVER] Received message: '{user_message}' -> Starting AI processing...")

    sentiment_data = analyze_sentiment(user_message)

    try:
        raw_response = generate_response(user_message)
        if hasattr(raw_response, 'message'):
            bot_response = raw_response.message.content
        else:
            bot_response = str(raw_response)
    except Exception as e:
        bot_response = "[error generating response] " + str(e)

    # 2. ADD THIS LINE TO SEE WHEN IT FINISHES
    print(f"[SERVER] Finished processing! Sending response back to browser.\n")

    return jsonify({
        "sentiment": sentiment_data,
        "response": bot_response
    })

if __name__ == "__main__":
    # use_reloader=False prevents the model from loading twice
    app.run(debug=True, use_reloader=False, port=5001)