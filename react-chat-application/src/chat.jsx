import { useEffect, useRef, useState } from "react";
import socket from "./socket";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log('data',data)
      setMessages((previousMessages) => [...previousMessages, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    socket.emit("join_chat", trimmedUsername);
    setUsername(trimmedUsername);
    setJoined(true);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    socket.emit("send_message", { username, message: trimmedMessage });
    setMessage("");
  };

  if (!joined) {
    return (
      <main className="join-page">
        <section className="join-card" aria-labelledby="join-title">
          <div className="brand-mark">C</div>
          <p className="eyebrow">WELCOME TO THE ROOM</p>
          <h1 id="join-title">Connect and chat.</h1>
          <p className="join-copy">
            Join the conversation and stay connected with your team in real time.
          </p>
          <form className="join-form" onSubmit={joinChat}>
            <label htmlFor="username">Your display name</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={30}
              autoComplete="name"
              autoFocus
            />
            <button type="submit">Enter chat <span aria-hidden="true">→</span></button>
          </form>
          <p className="secure-note"><span aria-hidden="true">●</span> Live room · Messages update instantly</p>
        </section>
      </main>
    );
  }

  return (
    <main className="chat-shell">
      <aside className="chat-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">C</div>
          <span>Circle</span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-card">
          <div className="workspace-icon">G</div>
          <div>
            <strong>General room</strong>
            <span>Everyone is here</span>
          </div>
          <span className="active-dot" />
        </div>
        <div className="sidebar-footer">
          <div className="profile-avatar">{getInitials(username)}</div>
          <div className="profile-copy"><strong>{username}</strong><span>Available</span></div>
          <span className="more-button">•••</span>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <div className="room-title"><span className="room-dot" /> General room</div>
            <p>Open conversation for everyone</p>
          </div>
          <div className="online-count"><span className="active-dot" /> Live</div>
        </header>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2>Start the conversation</h2>
              <p>Say hello to everyone in the room.</p>
            </div>
          ) : (
            <>
              <div className="date-divider"><span>Today</span></div>
              {messages.map((msg, index) => {
                const isOwnMessage = msg.username === username;
                const isSystemMessage = msg.username === "System";
                return (
                  <div className={`message-row ${isOwnMessage ? "own" : ""} ${isSystemMessage ? "system" : ""}`} key={`${msg.username}-${index}`}>
                    {!isOwnMessage && !isSystemMessage && <div className="message-avatar">{getInitials(msg.username)}</div>}
                    <div className="message-content">
                      {!isOwnMessage && !isSystemMessage && <span className="message-author">{msg.username}</span>}
                      <div className="message-bubble">{msg.message}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <input
            aria-label="Message"
            placeholder="Write a message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={500}
          />
          <button type="submit" aria-label="Send message" disabled={!message.trim()}>↑</button>
        </form>
        <p className="composer-hint">Press Enter to send</p>
      </section>
    </main>
  );
}

export default Chat;
