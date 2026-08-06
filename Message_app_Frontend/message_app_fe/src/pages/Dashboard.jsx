import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import {
    connectWebSocket,
    disconnectWebSocket,
    sendDeliveryStatus
} from "../services/websocket";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");


    const [selectedUser, setSelectedUser] = useState(null);
    const [incomingMessages, setIncomingMessages] = useState([]);
    const [statusUpdate, setStatusUpdate] = useState([]);
    const [messageStatusUpdate, setMessageStatusUpdate] = useState([]);
    const[ typingUser, setTypingUser]= useState(null);

    async function handleLogout() {
        // Close websocket before clearing storage
        try {
            await API.post(`/auth/logout?username=${username}`);
        } catch (error) {
            console.error("Logout failed:", error);
        }
        disconnectWebSocket();

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        setIncomingMessages([]);
        setSelectedUser(null);

        navigate("/login");
    }

    useEffect(() => {
        if (!username) return;

        connectWebSocket(
            username,
            //1. New chat message
            (message) => {
                console.log("Dashboard received:", message);

                setIncomingMessages((prev) => [...prev, message]);

                //mark the messages as "DELIVERED" when the user is already online
                if (message.receiver === username &&
                    message.status === "SENT"
                ) {
                    console.log("📦 Sending DELIVERED for:", message.id);

                    sendDeliveryStatus(message.id);
                }

            },

            // 2. User status
            (status) => {
                console.log(" User status:", status);

                setStatusUpdate((prev) => [...prev, status]);
            },

            // 3. Message status
            (update) => {
                console.log("Message status", update);

                setMessageStatusUpdate((prev) => [...prev, update]);
            },


            // 4. WebSocket Connected
            () => {

                console.log("Fetching pending messages...")

                API.get(`/chat/pending?username=${username}`)
                    .then((response) => {
                        console.log("Pending message:", response.data);

                        response.data.forEach((msg) => {
                            console.log("Sending delayed delivery:", msg.id);

                            sendDeliveryStatus(msg.id);
                        });
                    })
                    .catch(console.error);
            },

            (status)=>{
                console.log("⌨️ Typing status:", status);

                if(status.typing){
                    setTypingUser(status.sender);
                }
                else{
                    setTypingUser(null);
                }
            }


        );

        return () => {
            disconnectWebSocket();
        };
    }, [username]);

    return (
        <div style={styles.page}>
            <div style={styles.topbar}>
                <div>
                    <strong>{username}</strong>
                    <p>{email}</p>
                </div>

                <button
                    onClick={handleLogout}
                    style={styles.logout}
                >
                    Logout
                </button>
            </div>

            <div style={styles.chatLayout}>
                <UserList
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    statusUpdates={statusUpdate}
                />

                <ChatWindow
                    selectedUser={selectedUser}
                    incomingMessages={incomingMessages}
                    messageStatusUpdate={messageStatusUpdate}
                    typingUser={typingUser}
                />
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    topbar: {
        height: "65px",
        padding: "0 20px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
    },
    logout: {
        padding: "9px 15px",
        border: "none",
        borderRadius: "8px",
        background: "#ef4444",
        color: "white",
        cursor: "pointer",
    },
    chatLayout: {
        flex: 1,
        display: "flex",
        minHeight: 0,
    },
};

export default Dashboard;