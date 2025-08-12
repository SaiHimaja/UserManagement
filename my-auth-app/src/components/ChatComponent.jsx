import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ChatComponent = () => {
  const [sessionId, setSessionId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new session when component mounts
  useEffect(() => {
    axios.post("http://localhost:8080/chat", {})
      .then(res => {
        setSessionId(res.data);
      })
      .catch(err => {
        console.error("Failed to create chat session:", err);
      });
  }, []);

  const startStreaming = () => {
    if (!prompt.trim() || !sessionId) return;

    setIsStreaming(true);
    const userPrompt = prompt;
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userPrompt }]);
    
    // Add empty bot message that will be filled
    setMessages(prev => [...prev, { type: 'bot', content: '', streaming: true }]);

    // Close previous EventSource if exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Open SSE connection with prompt
    const es = new EventSource(
      `http://localhost:8080/chat/stream/${sessionId}?prompt=${encodeURIComponent(userPrompt)}`
    );

    es.onmessage = (event) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.type === 'bot') {
            lastMessage.content = (lastMessage.content.trimEnd() + ' ' + event.data.trimStart()).trim();
          }
          return newMessages;
        });
      };
      
    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.type === 'bot') {
          lastMessage.streaming = false;
        }
        return newMessages;
      });
    };

    es.addEventListener('close', () => {
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.type === 'bot') {
          lastMessage.streaming = false;
        }
        return newMessages;
      });
    });

    eventSourceRef.current = es;
    setPrompt("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startStreaming();
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '500px',
      margin: '30px auto 0',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(13, 71, 161, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        🤖 AI Assistant
      </div>

      {/* Messages Container */}
      <div style={{
        height: '300px',
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginTop: '60px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
            Start a conversation with your AI assistant
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.type === 'user' ? '#2196F3' : '#fff',
                color: msg.type === 'user' ? 'white' : '#333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
                {msg.streaming && (
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '12px',
                    backgroundColor: '#666',
                    marginLeft: '4px',
                    animation: 'blink 1s infinite'
                  }}>|</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <textarea
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '20px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
              minHeight: '40px',
              maxHeight: '100px'
            }}
            placeholder="Type your message... (Press Enter to send)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={(e) => e.target.style.borderColor = '#2196F3'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            disabled={isStreaming}
          />
          <button
            style={{
              padding: '12px',
              backgroundColor: (!sessionId || !prompt.trim() || isStreaming) ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: (!sessionId || !prompt.trim() || isStreaming) ? 'not-allowed' : 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onClick={startStreaming}
            disabled={!sessionId || !prompt.trim() || isStreaming}
            onMouseOver={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = '#1976D2';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = '#2196F3';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {isStreaming ? '⏸' : '➤'}
          </button>
        </div>
        
        {isStreaming && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            AI is typing...
          </div>
        )}
      </div>

      {/* CSS Animation for cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;