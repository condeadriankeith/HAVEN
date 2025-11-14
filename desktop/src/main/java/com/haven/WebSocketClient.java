package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.glassfish.tyrus.client.ClientManager;

import javax.websocket.*;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@ClientEndpoint
public class WebSocketClient {
    private static final String WEBSOCKET_URL = getWebSocketUrl();
        
        private static String getWebSocketUrl() {
            String backendUrl = System.getenv("HAVEN_BACKEND_URL");
            System.out.println("HAVEN_BACKEND_URL environment variable: '" + backendUrl + "'");
            
            if (backendUrl == null || backendUrl.trim().isEmpty()) {
                System.out.println("Using default backend URL: http://localhost:3000");
                backendUrl = "http://localhost:3000";
            } else {
                // Trim whitespace and any potential invisible characters
                backendUrl = backendUrl.trim();
                System.out.println("Using backend URL from environment: '" + backendUrl + "'");
            }
            
            // Convert HTTP URL to WebSocket URL
            String wsUrl;
            if (backendUrl.startsWith("https://")) {
                wsUrl = "wss://" + backendUrl.substring(8);
            } else if (backendUrl.startsWith("http://")) {
                wsUrl = "ws://" + backendUrl.substring(7);
            } else {
                wsUrl = backendUrl;
            }
            
            System.out.println("Constructed WebSocket URL: '" + wsUrl + "'");
            return wsUrl;
        }
    private Session userSession = null;
    private Gson gson = new Gson();
    private CountDownLatch latch = new CountDownLatch(1);
    private EmergencyUpdateListener emergencyUpdateListener;
    private ConnectionListener connectionListener;
    private List<JsonObject> activeEmergencies = new ArrayList<>();
    private boolean isConnected = false;
    private boolean subscribedToAlerts = false;
    private String authToken;
    
    // Message handler map
    private Map<String, MessageHandler> messageHandlers;

    public WebSocketClient() {
        initializeMessageHandlers();
    }
    
    private void initializeMessageHandlers() {
        messageHandlers = new HashMap<>();
        messageHandlers.put("authenticated", new AuthenticatedHandler(this));
        messageHandlers.put("emergency_update", new EmergencyUpdateHandler(this));
        messageHandlers.put("new-emergency-alert", new NewEmergencyAlertHandler(this));
        messageHandlers.put("emergency-status-changed", new EmergencyStatusChangedHandler(this));
        messageHandlers.put("current-emergencies", new CurrentEmergenciesHandler(this));
        messageHandlers.put("subscription-ack", new SubscriptionAckHandler(this));
        messageHandlers.put("status-update-ack", new StatusUpdateAckHandler(this));
        messageHandlers.put("emergency-ack", new EmergencyAckHandler(this));
        messageHandlers.put("error", new ErrorHandler(this));
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
        
        // Log the WebSocket URL being used
        System.out.println("Attempting to connect to WebSocket URL: '" + WEBSOCKET_URL + "'");
        
        // Validate the URI before attempting connection
        URI uri;
        try {
            uri = new URI(WEBSOCKET_URL);
            System.out.println("URI successfully parsed: " + uri.toString());
        } catch (URISyntaxException e) {
            System.err.println("Invalid URI format: " + WEBSOCKET_URL);
            throw new Exception("Invalid WebSocket URI format: " + e.getMessage(), e);
        }
        
        // Retry connection up to 3 times
        int attempts = 0;
        Exception lastException = null;
        
        while (attempts < 3) {
            try {
                client.connectToServer(this, uri);
                
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

            // Use polymorphic dispatch instead of switch statement
            MessageHandler handler = messageHandlers.get(type);
            if (handler != null) {
                handler.handle(data);
            } else {
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
    
    // Abstract base class for message handlers
    abstract class MessageHandler {
        protected WebSocketClient client;
        
        public MessageHandler(WebSocketClient client) {
            this.client = client;
        }
        
        public abstract void handle(JsonObject data);
        public abstract String getMessageType();
    }
    
    // Concrete implementations
    class AuthenticatedHandler extends MessageHandler {
        public AuthenticatedHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            System.out.println("WebSocket authenticated successfully");
            client.subscribeToEmergencyAlerts();
        }
        
        @Override
        public String getMessageType() {
            return "authenticated";
        }
    }
    
    class EmergencyUpdateHandler extends MessageHandler {
        public EmergencyUpdateHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            client.handleEmergencyUpdate(data);
        }
        
        @Override
        public String getMessageType() {
            return "emergency_update";
        }
    }
    
    class NewEmergencyAlertHandler extends MessageHandler {
        public NewEmergencyAlertHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            client.handleNewEmergencyAlert(data);
        }
        
        @Override
        public String getMessageType() {
            return "new-emergency-alert";
        }
    }
    
    class EmergencyStatusChangedHandler extends MessageHandler {
        public EmergencyStatusChangedHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            client.handleEmergencyStatusChanged(data);
        }
        
        @Override
        public String getMessageType() {
            return "emergency-status-changed";
        }
    }
    
    class CurrentEmergenciesHandler extends MessageHandler {
        public CurrentEmergenciesHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            client.handleCurrentEmergencies(data);
        }
        
        @Override
        public String getMessageType() {
            return "current-emergencies";
        }
    }
    
    class SubscriptionAckHandler extends MessageHandler {
        public SubscriptionAckHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            System.out.println("Subscribed to emergency alerts successfully");
            // Set a flag to indicate that we're subscribed
            client.subscribedToAlerts = true;
        }
        
        @Override
        public String getMessageType() {
            return "subscription-ack";
        }
    }
    
    class StatusUpdateAckHandler extends MessageHandler {
        public StatusUpdateAckHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            System.out.println("Emergency status update acknowledged");
        }
        
        @Override
        public String getMessageType() {
            return "status-update-ack";
        }
    }
    
    class EmergencyAckHandler extends MessageHandler {
        public EmergencyAckHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            System.out.println("Emergency alert acknowledged by server");
        }
        
        @Override
        public String getMessageType() {
            return "emergency-ack";
        }
    }
    
    class ErrorHandler extends MessageHandler {
        public ErrorHandler(WebSocketClient client) {
            super(client);
        }
        
        @Override
        public void handle(JsonObject data) {
            String errorMessage = data.has("message") ? data.get("message").getAsString() : "Unknown error";
            System.err.println("WebSocket error: " + errorMessage);
            if (client.connectionListener != null) {
                client.connectionListener.onError(errorMessage);
            }
        }
        
        @Override
        public String getMessageType() {
            return "error";
        }
    }
}