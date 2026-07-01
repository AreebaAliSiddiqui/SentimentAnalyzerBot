// Automatically wire up the "Enter" key for intuitive user messaging
document.getElementById("messageInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    const inputElement = document.getElementById("messageInput");
    const chatWindow = document.getElementById("chatWindow");
    const messageText = inputElement.value.trim();

    // Prevent dispatching empty messages
    if (!messageText) return;

    // 1. Append User Bubble instantly to the screen
    appendMessage(messageText, 'user');
    inputElement.value = ""; // Clear input immediately for snappy feel

    // 2. Generate and append the animated bouncing typing indicator
    const typingIndicatorId = appendTypingIndicator();
    scrollToBottom();

    try {
        // 3. Request data securely from the backend
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: messageText })
        });

        const data = await response.json();

        // Remove the typing loader once data lands safely
        removeElement(typingIndicatorId);

        // 4. Extract sentiment values confidently
        let sentimentLabel = "NEUTRAL";
        if (data.sentiment) {
            sentimentLabel = typeof data.sentiment === 'object' ? (data.sentiment.label || "NEUTRAL") : data.sentiment;
        }

        // 5. Append Bot response paired with custom sentiment badge UI
        appendMessage(data.response, 'bot', sentimentLabel);

    } catch (error) {
        removeElement(typingIndicatorId);
        appendMessage("[Connection Error] The backend server failed to respond.", 'bot', 'NEGATIVE');
    }

    scrollToBottom();
}

// Helper function to build and render message blocks
function appendMessage(text, sender, sentiment = null) {
    const chatWindow = document.getElementById("chatWindow");
    
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message", `${sender}-message`, "animated-fade");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    contentDiv.innerText = text;
    messageContainer.appendChild(contentDiv);

    // If it's a bot response, stamp it with an appropriate color-coded sentiment context
    if (sender === 'bot' && sentiment) {
        const badge = document.createElement("div");
        badge.classList.add("sentiment-badge");
        
        const cleanSentiment = sentiment.toUpperCase();
        if (cleanSentiment.includes("POS")) {
            badge.classList.add("badge-positive");
            badge.innerText = "😊 Positive";
        } else if (cleanSentiment.includes("NEG")) {
            badge.classList.add("badge-negative");
            badge.innerText = "😔 Negative";
        } else {
            badge.classList.add("badge-neutral");
            badge.innerText = "😐 Neutral";
        }
        messageContainer.appendChild(badge);
    }

    chatWindow.appendChild(messageContainer);
    scrollToBottom();
}

// Creates an active animated loader sequence inside a stylized chat container
function appendTypingIndicator() {
    const chatWindow = document.getElementById("chatWindow");
    const uniqueId = "typing-" + Date.now();

    const loaderContainer = document.createElement("div");
    loaderContainer.id = uniqueId;
    loaderContainer.classList.add("message", "bot-message", "animated-fade");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    contentDiv.appendChild(typingIndicator);
    loaderContainer.appendChild(contentDiv);
    chatWindow.appendChild(loaderContainer);
    
    return uniqueId;
}

function removeElement(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function scrollToBottom() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.scrollTop = chatWindow.scrollHeight;
}