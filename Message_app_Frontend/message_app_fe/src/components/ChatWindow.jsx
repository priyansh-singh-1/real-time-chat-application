
import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import {
    sendMessage as sendWebSocketMessage,
    sendSeenStatus, sendTypingStatus
} from "../services/websocket";

function ChatWindow({
    selectedUser,
    incomingMessages = [],
    messageStatusUpdate = [],
    typingUser
}) {
    const currentUsername = localStorage.getItem("username");

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const typingTimer = useRef(null);

    const messagesEndRef = useRef(null);

    // Keep track of messages for which SEEN was already sent
    const seenMessagesRef = useRef(new Set());

    // --------------------------------------------------
    // SEND MESSAGE
    // --------------------------------------------------

    function sendMessage(e) {
        e.preventDefault();

        if (!selectedUser || !content.trim()) return;

        const newMessage = {
            sender: currentUsername,
            receiver: selectedUser.username,
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };

        sendWebSocketMessage(newMessage);

        setContent("");
    }

    // handle typing status
    const handleTyping = (e) => {
        const value = e.target.value;

        setContent(value);

        if (!selectedUser) return;

        console.log("⌨️ User typing:", {
            sender: currentUsername,
            receiver: selectedUser.username,
            value
        });


        sendTypingStatus(
            currentUsername,
            selectedUser.username,
            true
        );

        //Previous timer cancel
        clearTimeout(typingTimer.current);

        //User stopped typing
        typingTimer.current = setTimeout(() => {
            console.log("⌨️ User stopped typing");

            sendTypingStatus(
                currentUsername,
                selectedUser.username,
                false
            )
        }, 1000)
    };

    // Clear typing timer when component unmounts
    useEffect(() => {
        return () => {
            clearTimeout(typingTimer.current);
        }
    }, []);

    // --------------------------------------------------
    // LOAD CHAT HISTORY
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedUser) {
            setMessages([]);
            return;
        }

        let cancelled = false;

        async function fetchHistory() {
            try {
                setLoading(true);
                setMessage("");

                const response = await API.get(
                    `/chat/history?sender=${currentUsername}&receiver=${selectedUser.username}`
                );

                if (cancelled) return;

                const history = response.data || [];

                setMessages(history);

                // Mark unread received messages as SEEN
                history.forEach((msg) => {
                    if (
                        msg.receiver === currentUsername &&
                        msg.status !== "SEEN" &&
                        msg.id &&
                        !seenMessagesRef.current.has(msg.id)
                    ) {
                        console.log("Sending SEEN for:", msg.id);

                        seenMessagesRef.current.add(msg.id);

                        sendSeenStatus(msg.id);
                    }
                });

            } catch (error) {
                console.error("Failed to load chat history:", error);

                if (!cancelled) {
                    setMessage("Failed to load chat history");
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchHistory();

        return () => {
            cancelled = true;
        };

    }, [selectedUser, currentUsername]);


    // --------------------------------------------------
    // HANDLE LIVE WEBSOCKET MESSAGES
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedUser || !incomingMessages.length) return;

        const relevantMessages = incomingMessages.filter(
            (msg) =>
                (
                    msg.sender === selectedUser.username &&
                    msg.receiver === currentUsername
                ) ||
                (
                    msg.sender === currentUsername &&
                    msg.receiver === selectedUser.username
                )
        );

        if (!relevantMessages.length) return;

        setMessages((prev) => {
            const updated = [...prev];

            relevantMessages.forEach((msg) => {

                const exists = updated.some(
                    (existing) =>
                        getMessageKey(existing) === getMessageKey(msg)
                );

                if (!exists) {
                    updated.push(msg);
                }

                // Mark incoming message as SEEN only once
                if (
                    msg.receiver === currentUsername &&
                    msg.id &&
                    !seenMessagesRef.current.has(msg.id)
                ) {
                    console.log(
                        "New incoming message marked SEEN:",
                        msg.id
                    );

                    seenMessagesRef.current.add(msg.id);

                    sendSeenStatus(msg.id);
                }
            });

            return updated;
        });

    }, [incomingMessages, selectedUser, currentUsername]);


    // --------------------------------------------------
    // HANDLE MESSAGE STATUS UPDATES
    // --------------------------------------------------

    useEffect(() => {
        if (!messageStatusUpdate.length) return;

        setMessages((prev) =>
            prev.map((msg) => {

                const updates = messageStatusUpdate.filter(
                    (status) => status.messageId === msg.id
                );

                if (!updates.length) {
                    return msg;
                }

                const latestUpdate =
                    updates[updates.length - 1];

                return {
                    ...msg,
                    status: latestUpdate.status,
                };
            })
        );

    }, [messageStatusUpdate]);


    // --------------------------------------------------
    // AUTO SCROLL
    // --------------------------------------------------

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);


    // --------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------

    if (!selectedUser) {
        return (
            <div style={styles.empty}>
                <h3>Select a user to start chatting</h3>
            </div>
        );
    }


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <h3>{selectedUser.username}</h3>
                <p>{selectedUser.email}</p>
            </div>

            <div style={styles.messages}>

                {loading && <p>Loading...</p>}

                {!loading && message && (
                    <p style={{ color: "red" }}>
                        {message}
                    </p>
                )}

                {messages.map((msg) => {

                    const isMine =
                        msg.sender === currentUsername;

                    return (
                        <div
                            key={getMessageKey(msg)}
                            style={{
                                ...styles.messageRow,
                                justifyContent: isMine
                                    ? "flex-end"
                                    : "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    ...styles.messageBubble,
                                    background: isMine
                                        ? "#2563eb"
                                        : "#e5e7eb",
                                    color: isMine
                                        ? "#fff"
                                        : "#000",
                                }}
                            >

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "15px",
                                        lineHeight: "1.4",
                                    }}
                                >
                                    {msg.content}
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "12px",
                                        opacity: 0.8,
                                    }}
                                >

                                    <small>
                                        {formatTime(msg.timestamp)}
                                    </small>

                                    {isMine && (
                                        <small>

                                            {msg.status === "SENT" &&
                                                "✓"}

                                            {msg.status === "DELIVERED" &&
                                                "✓✓"}

                                            {msg.status === "SEEN" && (
                                                <span
                                                    style={{
                                                        color: "#53bdeb"
                                                    }}
                                                >
                                                    ✓✓
                                                </span>
                                            )}

                                        </small>
                                    )}

                                </div>

                            </div>
                        </div>
                    );
                })}

                {typingUser === selectedUser?.username && (
                    <div style={styles.typingIndicator}>
                        {selectedUser.username} is typing...
                    </div>
                )}

                <div ref={messagesEndRef} />

            </div>


            <form
                onSubmit={sendMessage}
                style={styles.form}
            >

                <input
                    type="text"
                    placeholder="Type a message..."
                    value={content}
                    onChange={handleTyping}

                    style={styles.input}
                />

                <button
                    type="submit"
                    disabled={!content.trim()}
                    style={{
                        ...styles.button,
                        opacity: content.trim() ? 1 : 0.5,
                        cursor: content.trim()
                            ? "pointer"
                            : "not-allowed",
                    }}
                >
                    Send
                </button>

            </form>

        </div>
    );
}


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatTime(timestamp) {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}


function getMessageKey(message) {
    return (
        message.id ??
        `${message.sender}-${message.receiver}-${message.timestamp}-${message.content}`
    );
}


// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = {
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },

    empty: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#777",
    },

    header: {
        padding: "15px",
        borderBottom: "1px solid #ddd",
    },

    messages: {
        flex: 1,
        padding: "15px",
        overflowY: "auto",
        background: "#f8fafc",
    },

    messageRow: {
        display: "flex",
        marginBottom: "10px",
    },

    messageBubble: {
        maxWidth: "70%",
        padding: "10px 14px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        wordBreak: "break-word",
    },

    form: {
        display: "flex",
        padding: "15px",
        borderTop: "1px solid #ddd",
        gap: "10px",
    },

    input: {
        flex: 1,
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "15px",
    },

    button: {
        padding: "12px 18px",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "white",
    },

    typingIndicator: {
        fontSize: "13px",
        color: "#6b7280",
        fontStyle: "italic",
        padding: "5px 10px",
    },
};


export default ChatWindow;

