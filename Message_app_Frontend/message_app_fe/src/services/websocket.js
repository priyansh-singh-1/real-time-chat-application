import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectWebSocket(username, onMessageReceived, onStatusReceived, onMessageStatusReceived, onConnected, onTypingReceived) {
    disconnectWebSocket();

    stompClient = new Client({
        brokerURL: "ws://localhost:8080/ws",
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => 
            {
                
            console.log("✅ WebSocket Connected");

            // new chat message
            stompClient.subscribe(`/topic/messages/${username}`, (message) => {
                const body = JSON.parse(message.body);

                console.log("📩 Received:", body);

                if (onMessageReceived) {
                    onMessageReceived(body);
                }
            });

            console.log("Subscribing to status...");

            //ONLINE/OFFLINE status
            stompClient.subscribe("/topic/status", (message) => { 
                console.log("🔥 Raw Status:", message);
                const status = JSON.parse(message.body);

                console.log("🟢 User Status:", status);

                if (onStatusReceived) {
                    onStatusReceived(status);
                }

            });
            console.log("Finished subscribing");

            // Delivery status
            stompClient.subscribe("/topic/message-status", (message) => { //Message delivery statua
                const status = JSON.parse(message.body);

                console.log("✅ Message Status:", status);

                if (onMessageStatusReceived) {
                    onMessageStatusReceived(status);
                }


            });

            stompClient.subscribe(
                `/topic/typing/${username}`,
                (message)=>{
                    const typingStatus= JSON.parse(message.body);

                    console.log("⌨️ Typing Status:", typingStatus);

                    if(onTypingReceived){
                        onTypingReceived(typingStatus);
                    }
                }
            );

            // Notify Dashboard that WebSocket is ready
            if (onConnected) {
                onConnected();

            }
        },
        onStompError: (frame) => {
            console.error("STOMP Error:", frame);
        },
        onWebSocketError: (error) => {
            console.log("WebSocket Error:", error);
        },
    });

    stompClient.activate();
}

export function sendMessage(message) {
    if (stompClient?.connected) {
        stompClient.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(message),
        });
    } else {
        console.log("WebSocket not connected");
    }
}

export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}

export function sendDeliveryStatus(messageId) {
    if (!stompClient?.connected) return;

    stompClient.publish({
        destination: "/app/message.delivered",
        body: JSON.stringify({
            messageId: messageId,
            status: "DELIVERED"
        })


    });
}

export function sendSeenStatus(messageId){
    if(!stompClient?.connected) {
        console.log("❌ Cannot send SEEN - WebSocket not connected");
    return;
    }

    console.log("👀 Sending SEEN:", messageId);
    
    stompClient.publish({
        destination:"/app/message.delivered",
        body: JSON.stringify({
            messageId: messageId,
            status: "SEEN"
        })
    });

    console.log("Seen status sent for:",messageId);
}

export function sendTypingStatus(sender, receiver, typing){
    if(!stompClient?.connected) {
        console.log("❌ Cannot send typing - WebSocket not connected");
        return;
    }

    console.log("sending typing: ",{
        sender,
        receiver,
        typing
    });

    stompClient.publish({
        destination: "/app/typing",
        body: JSON.stringify({
            sender: sender,
            receiver: receiver,
            typing: typing

        })
    });
}
