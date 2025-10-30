package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.glassfish.tyrus.client.ClientManager;

import javax.websocket.*;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CountDownLatch;

@ClientEndpoint
public class WebSocketClient {
    private static final String WEBSOCKET_URL = "ws://localhost:3000";
    private Session userSession = null;
    private Gson gson = new Gson();
    private CountDownLatch latch = new CountDownLatch(1);
    private EmergencyUpdateListener emergencyUpdateListener;

    public WebSocketClient() {
    }

    public void setEmergencyUpdateListener(EmergencyUpdateListener listener) {
        this.emergencyUpdateListener = listener;
    }

    public void connect(String token) throws Exception {
        ClientManager client = ClientManager.createClient();
        client.connectToServer(this, new URI(WEBSOCKET_URL));
        latch.await(); // Wait for connection to be established

        // Authenticate after connection if token is provided
        if (token != null && !token.isEmpty()) {
            authenticate(token);
        }
    }

    @OnOpen
    public void onOpen(Session userSession) {
        System.out.println("WebSocket connection opened");
        this.userSession = userSession;
        latch.countDown();
    }

    @OnClose
    public void onClose(Session userSession, CloseReason reason) {
        System.out.println("WebSocket connection closed: " + reason);
        this.userSession = null;
    }

    @OnError
    public void onError(Session userSession, Throwable throwable) {
        System.err.println("WebSocket error: " + throwable.getMessage());
        throwable.printStackTrace();
    }

    @OnMessage
    public void onMessage(String message) {
        try {
            JsonObject data = JsonParser.parseString(message).getAsJsonObject();
            String type = data.get("type").getAsString();

            switch (type) {
                case "authenticated":
                    System.out.println("WebSocket authenticated successfully");
                    break;
                case "emergency_update":
                    if (emergencyUpdateListener != null) {
                        JsonObject emergency = data.get("emergency").getAsJsonObject();
                        emergencyUpdateListener.onEmergencyUpdate(emergency);
                    }
                    break;
                case "error":
                    String errorMessage = data.get("message").getAsString();
                    System.err.println("WebSocket error: " + errorMessage);
                    break;
                default:
                    System.out.println("Unknown message type: " + type);
            }
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void authenticate(String token) {
        JsonObject authMessage = new JsonObject();
        authMessage.addProperty("type", "authenticate");
        authMessage.addProperty("token", token);
        sendMessage(authMessage.toString());
    }

    public void sendEmergencyUpdate(JsonObject emergency) {
        JsonObject message = new JsonObject();
        message.addProperty("type", "emergency_update");
        message.add("emergency", emergency);
        sendMessage(message.toString());
    }

    private void sendMessage(String message) {
        if (userSession != null && userSession.isOpen()) {
            try {
                userSession.getBasicRemote().sendText(message);
            } catch (IOException e) {
                System.err.println("Error sending WebSocket message: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("WebSocket session is not open");
        }
    }

    public void disconnect() {
        if (userSession != null) {
            try {
                userSession.close();
            } catch (IOException e) {
                System.err.println("Error closing WebSocket session: " + e.getMessage());
            }
        }
    }

    public interface EmergencyUpdateListener {
        void onEmergencyUpdate(JsonObject emergency);
    }
}