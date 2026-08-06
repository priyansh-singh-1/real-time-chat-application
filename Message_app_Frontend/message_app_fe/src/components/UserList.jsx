import { useEffect, useState } from "react";
import API from "../services/api";

function UsersList({ selectedUser, setSelectedUser, statusUpdates }) {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const currentUsername = localStorage.getItem("username");



    useEffect(() => {
        if (!currentUsername) return;

        let cancelled = false;

        setLoading(true);

        API.get(
            `/users/get-all?currentUsername=${encodeURIComponent(
                currentUsername
            )}`
        )
            .then((response) => {
                if (!cancelled) {
                    setUsers(response.data);
                    setMessage("");
                }
            })
            .catch((error) => {
                console.error("Failed to load users:", error);

                if (!cancelled) {
                    setMessage("Failed to load users");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [currentUsername]);

    useEffect(() => {
        if (!statusUpdates || statusUpdates.length === 0) return;

        const latest = statusUpdates[statusUpdates.length - 1];

        setUsers((prev) =>
            prev.map((user) =>
                user.username === latest.username
                    ? { ...user, online: latest.online }
                    : user
            )
        );
    }, [statusUpdates]);

    return (
        <div style={styles.container}>
            <h3 style={styles.heading}>Users</h3>

            {loading && (
                <p style={styles.message}>
                    Loading users...
                </p>
            )}

            {!loading && message && (
                <p style={styles.message}>{message}</p>
            )}

            {!loading && users.length === 0 && !message && (
                <p style={styles.message}>No users found</p>
            )}

            {!loading &&
                users.map((user) => (
                    <div
                        key={user.id ?? user.username}
                        onClick={() => setSelectedUser(user)}
                        style={{
                            ...styles.userItem,
                            background:
                                selectedUser?.username === user.username
                                    ? "#E8F0FE"
                                    : "#fff",
                            border:
                                selectedUser?.username === user.username
                                    ? "2px solid #2563eb"
                                    : "1px solid #e5e7eb",
                        }}
                    >
                        <div>
                            <strong>{user.username}</strong>

                            <p style={styles.email}>
                                {user.email}
                            </p>
                        </div>

                        <div style={styles.statusContainer}>
                            <span
                                style={{
                                    ...styles.status,
                                    background: user.online
                                        ? "#22c55e"
                                        : "#9ca3af",
                                }}
                            />

                            <small>
                                {user.online
                                    ? "Online"
                                    : "Offline"}
                            </small>
                        </div>
                    </div>
                ))}
        </div>
    );
}

const styles = {
    container: {
        width: "280px",
        borderRight: "1px solid #ddd",
        padding: "15px",
        overflowY: "auto",
        background: "#fff",
    },

    heading: {
        marginBottom: "20px",
    },

    userItem: {
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "10px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "0.2s",
    },

    email: {
        marginTop: "4px",
        fontSize: "13px",
        color: "#666",
    },

    statusContainer: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    status: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
    },

    message: {
        color: "#666",
        fontSize: "14px",
    },
};

export default UsersList;