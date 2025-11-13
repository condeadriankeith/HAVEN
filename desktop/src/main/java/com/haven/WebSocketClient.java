package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.glassfish.tyrus.client.ClientManager;

import javax.websocket.*;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.ArrayList;
import java.util.List;

@ClientEndpoint
public class WebSocketClient {
    private static final String WEBSOCKET_URL = "ws://localhost:3000";
    private Session userSession = null;
    private Gson gson = new Gson();
    private CountDownLatch latch = new CountDownLatch(1);
    private EmergencyUpdateListener emergencyUpdateListener;
    private ConnectionListener connectionListener;
    private List<JsonObject> activeEmergencies = new ArrayList<>();
    private boolean isConnected = false;
    private boolean subscribedToAlerts = false;
    private String authToken;

    public WebSocketClient() {
    }

    public void setEmergencyUpdateListener(EmergencyUpdateListener listener) {
        this.emergencyUpdateListener = listener;
    }

    public void setConnectionListener(ConnectionListener listener) {
        this.connectionListener = listener;
    }

    public void connect(String token) throws Exception {
        this.authToken = token;
        ClientManager client = ClientManager.createClient();
        
        // Retry connection up to 3 times
        int attempts = 0;
        Exception lastException = null;
        
        while (attempts < 3) {
            try {
                client.connectToServer(this, new URI(WEBSOCKET_URL));
                
                // Wait for connection to be established with timeout
                if (!latch.await(10, TimeUnit.SECONDS)) {
                    throw new Exception("WebSocket connection timeout");
                }

                // Authenticate after connection if token is provided
                if (token != null && !token.isEmpty()) {
                    authenticate(token);
                }
                // For prototype, subscription is now handled in onOpen method
                // This ensures the session is fully established before subscribing
                
                // If we get here, connection was successful
                return;
            } catch (Exception e) {
                lastException = e;
                attempts++;
                System.err.println("WebSocket connection attempt " + attempts + " failed: " + e.getMessage());
                
                if (attempts < 3) {
                    // Wait before retrying
                    Thread.sleep(2000);
                }
            }
        }
        
        // If we get here, all attempts failed
        throw new Exception("Failed to connect to WebSocket after 3 attempts", lastException);
    }

    @OnOpen
    public void onOpen(Session userSession) {
        System.out.println("WebSocket connection opened");
        this.userSession = userSession;
        this.isConnected = true;
        
        // Subscribe to emergency alerts immediately after connection
        if (authToken == null || authToken.isEmpty()) {
            // For prototype, subscribe to emergency alerts without authentication
            subscribeToEmergencyAlerts();
        }
        
        latch.countDown();
        
        if (connectionListener != null) {
            connectionListener.onConnected();
        }
    }

    @OnClose
    public void onClose(Session userSession, CloseReason reason) {
        System.out.println("WebSocket connection closed: " + reason);
        this.userSession = null;
        this.isConnected = false;
        
        if (connectionListener != null) {
            connectionListener.onDisconnected();
        }
    }

    @OnError
    public void onError(Session userSession, Throwable throwable) {
        System.err.println("WebSocket error: " + throwable.getMessage());
        throwable.printStackTrace();
        
        if (connectionListener != null) {
            connectionListener.onError(throwable.getMessage());
        }
    }

    @OnMessage
    public void onMessage(String message) {
        try {
            System.out.println("Received WebSocket message: " + message);
            
            JsonObject data = JsonParser.parseString(message).getAsJsonObject();
            if (!data.has("type")) {
                System.err.println("Received message without type field: " + message);
                return;
            }
            String type = data.get("type").getAsString();

            System.out.println("Processing message type: " + type);

            switch (type) {
                case "authenticated":
                    System.out.println("WebSocket authenticated successfully");
                    subscribeToEmergencyAlerts();
                    break;
                case "emergency_update":
                    handleEmergencyUpdate(data);
                    break;
                case "new-emergency-alert":
                    handleNewEmergencyAlert(data);
                    break;
                case "emergency-status-changed":
                    handleEmergencyStatusChanged(data);
                    break;
                case "current-emergencies":
                    handleCurrentEmergencies(data);
                    break;
                case "subscription-ack":
                    System.out.println("Subscribed to emergency alerts successfully");
                    // Set a flag to indicate that we're subscribed
                    this.subscribedToAlerts = true;
                    break;
                case "status-update-ack":
                    System.out.println("Emergency status update acknowledged");
                    break;
                case "emergency-ack":
                    System.out.println("Emergency alert acknowledged by server");
                    break;
                case "error":
                    String errorMessage = data.has("message") ? data.get("message").getAsString() : "Unknown error";
                    System.err.println("WebSocket error: " + errorMessage);
                    if (connectionListener != null) {
                        connectionListener.onError(errorMessage);
                    }
                    break;
                default:
                    System.out.println("Unknown message type: " + type);
                    System.out.println("Message content: " + message);
            }
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            System.err.println("Raw message: " + message);
            e.printStackTrace();
        }
    }

    private void handleEmergencyUpdate(JsonObject data) {
        if (emergencyUpdateListener != null) {
            // The emergency data might be in different locations depending on how it's sent
            JsonObject emergency = null;
            
            // Check if emergency data is in the "emergency" field
            if (data.has("emergency")) {
                emergency = data.getAsJsonObject("emergency");
            } 
            // Check if emergency data is directly in the data object
            else if (data.has("emergencyId")) {
                emergency = data;
            }
            // If we still don't have emergency data, log and return
            else {
                System.err.println("No emergency data found in emergency_update message: " + data.toString());
                return;
            }
            
            emergencyUpdateListener.onEmergencyUpdate(emergency);
        }
    }

    private void handleNewEmergencyAlert(JsonObject data) {
        System.out.println("Handling new emergency alert: " + data.toString());
        
        if (emergencyUpdateListener != null) {
            // The emergency data might be in different locations depending on how it's sent
            JsonObject emergency = null;
            
            // Check if emergency data is in the "emergency" field (from mobile app)
            if (data.has("emergency")) {
                emergency = data.getAsJsonObject("emergency");
            } 
            // Check if emergency data is directly in the data object (from REST API or direct WebSocket)
            else if (data.has("emergencyId")) {
                emergency = data;
            }
            // If we still don't have emergency data, log and return
            else {
                System.err.println("No emergency data found in message: " + data.toString());
                return;
            }
            
            System.out.println("Passing emergency to listener: " + emergency.toString());
            emergencyUpdateListener.onEmergencyUpdate(emergency);
            
            // Play audio alert
            playAlertSound();
        } else {
            System.out.println("No emergency update listener registered");
        }
    }

    private void handleEmergencyStatusChanged(JsonObject data) {
        if (emergencyUpdateListener != null) {
            JsonObject emergency = data.has("emergency") ? data.getAsJsonObject("emergency") : data;
            emergencyUpdateListener.onEmergencyUpdate(emergency);
        }
    }

    private void handleCurrentEmergencies(JsonObject data) {
        // Handle current emergencies sent on connection
        System.out.println("Received current emergencies: " + data.toString());
    }

    private void playAlertSound() {
        // In a real implementation, this would play an actual sound
        System.out.println("[ALERT] Playing emergency alert sound!");
        // You could implement actual sound playback using Java Sound API
    }

    public void authenticate(String token) {
        JsonObject authMessage = new JsonObject();
        authMessage.addProperty("type", "authenticate");
        authMessage.addProperty("token", token);
        sendMessage(authMessage.toString());
    }

    public void subscribeToEmergencyAlerts() {
        JsonObject subscribeMessage = new JsonObject();
        subscribeMessage.addProperty("type", "subscribe-emergency-alerts");
        sendMessage(subscribeMessage.toString());
    }

    public void sendEmergencyUpdate(JsonObject emergency) {
        JsonObject message = new JsonObject();
        message.addProperty("type", "emergency_update");
        message.add("emergency", emergency);
        sendMessage(message.toString());
    }

    public void updateEmergencyStatus(String emergencyId, String newStatus, String responderId) {
        JsonObject statusUpdateMessage = new JsonObject();
        statusUpdateMessage.addProperty("type", "emergency-status-update");
        statusUpdateMessage.addProperty("emergencyId", emergencyId);
        statusUpdateMessage.addProperty("newStatus", newStatus);
        statusUpdateMessage.addProperty("responderId", responderId);
        sendMessage(statusUpdateMessage.toString());
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
        this.isConnected = false;
    }

    public boolean isConnected() {
        return this.isConnected;
    }

    public interface EmergencyUpdateListener {
        void onEmergencyUpdate(JsonObject emergency);
    }

    public interface ConnectionListener {
        void onConnected();
        void onDisconnected();
        void onError(String errorMessage);
    }
}