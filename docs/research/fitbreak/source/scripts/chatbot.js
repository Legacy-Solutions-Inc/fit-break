// FitBreak Custom Chatbot Widget
// Uses Cloud Function proxy for Dialogflow CX

(function() {
  const CHATBOT_ENDPOINT = 'https://asia-east2-fitbreak-ai.cloudfunctions.net/chatbot';

  // Generate or retrieve session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('fitbreak_chat_session');
    if (!sessionId) {
      sessionId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fitbreak_chat_session', sessionId);
    }
    return sessionId;
  }

  // Create chat widget HTML
  function createChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'fitbreak-chatbot';
    widget.innerHTML = `
      <style>
        #fitbreak-chatbot {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        /* Move chatbot up on mobile to clear bottom navigation bar */
        @media (max-width: 1023px) {
          #fitbreak-chatbot {
            bottom: 80px;
          }
        }

        #chat-bubble {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #D71E49;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(215, 30, 73, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        #chat-bubble:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(215, 30, 73, 0.5);
        }

        #chat-bubble svg {
          width: 28px;
          height: 28px;
          fill: white;
        }

        #chat-window {
          display: none;
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 350px;
          max-width: calc(100vw - 32px);
          height: 500px;
          max-height: calc(100vh - 100px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          flex-direction: column;
          overflow: hidden;
        }

        #chat-window.open {
          display: flex;
        }

        #chat-header {
          background: #D71E49;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        #chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-message {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .chat-message.bot {
          background: #F3F4F6;
          color: #1F2937;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .chat-message.user {
          background: #D71E49;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .chat-message.typing {
          background: #F3F4F6;
          align-self: flex-start;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        #chat-input-container {
          padding: 12px 16px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          gap: 8px;
        }

        #chat-input {
          flex: 1;
          border: 1px solid #E5E7EB;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        #chat-input:focus {
          border-color: #D71E49;
        }

        #chat-send {
          width: 40px;
          height: 40px;
          border: none;
          background: #D71E49;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        #chat-send:hover {
          background: #B91C3E;
        }

        #chat-send:disabled {
          background: #E5E7EB;
          cursor: not-allowed;
        }

        #chat-send svg {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 400px) {
          #chat-window {
            width: calc(100vw - 32px);
            height: calc(100vh - 100px);
            bottom: 70px;
            right: 0;
          }
        }
      </style>

      <div id="chat-window">
        <div id="chat-header">
          <h3>FitBreak Assistant</h3>
          <button id="chat-close">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-input-container">
          <input type="text" id="chat-input" placeholder="Ask something..." autocomplete="off">
          <button id="chat-send">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div id="chat-bubble">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
    `;
    document.body.appendChild(widget);

    // Initialize event listeners
    initChatEvents();

    // Show welcome message after a short delay
    setTimeout(() => {
      addBotMessage("Hi! I'm the FitBreak Assistant.\n\nI can help you with:\n• Class schedules\n• Pricing and packages\n• How to book\n• Our location\n• How credits work\n\nWhat would you like to know?");
    }, 500);
  }

  function initChatEvents() {
    const bubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    // Toggle chat window
    bubble.addEventListener('click', () => {
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open')) {
        input.focus();
      }
    });

    // Close chat
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
    });

    // Send message on Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
  }

  function addBotMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message bot';
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message user';
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message typing';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const message = input.value.trim();

    if (!message) return;

    // Clear input and disable send
    input.value = '';
    sendBtn.disabled = true;

    // Show user message
    addUserMessage(message);

    // Show typing indicator
    showTypingIndicator();

    try {
      const response = await fetch(CHATBOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sessionId: getSessionId()
        })
      });

      const data = await response.json();

      hideTypingIndicator();

      if (data.response) {
        addBotMessage(data.response);
      } else if (data.fallback) {
        addBotMessage(data.fallback);
      } else {
        addBotMessage("Sorry, I couldn't process that. Please try again.");
      }
    } catch (error) {
      console.error('Chat error:', error);
      hideTypingIndicator();
      addBotMessage("Sorry, I'm having trouble connecting. Please try again or contact us at support@fitbreak.ph");
    }

    sendBtn.disabled = false;
    input.focus();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
