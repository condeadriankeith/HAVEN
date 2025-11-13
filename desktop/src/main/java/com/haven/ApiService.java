package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class ApiService {
    private static final String BASE_URL = (System.getenv("HAVEN_BACKEND_URL") != null ? System.getenv("HAVEN_BACKEND_URL").trim() : "http://localhost:3000").trim();
    private static ApiService instance;
    private HttpClient client;
    private Gson gson;
    private String authToken;
    private WebSocketClient webSocketClient;

    private ApiService() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.gson = new Gson();
        this.webSocketClient = new WebSocketClient();
        // For prototype, we don't need to authenticate
        // this.authToken = null;
    }

    public static synchronized ApiService getInstance() {
        if (instance == null) {
            instance = new ApiService();
        }
        return instance;
    }

    public void setAuthToken(String token) {
        this.authToken = token;
    }

    public String getAuthToken() {
        return this.authToken;
    }

    public WebSocketClient getWebSocketClient() {
        return this.webSocketClient;
    }

    // Auth endpoints
    public JsonObject login(String email, String password) throws IOException, InterruptedException {
        Map<String, String> credentials = new HashMap<>();
        credentials.put("email", email);
        credentials.put("password", password);

        String requestBody = gson.toJson(credentials);
        
        System.out.println("Making login request to: " + BASE_URL + "/api/v1/auth/login");
        System.out.println("Request body: " + requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/auth/login"))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("User-Agent", "HAVEN Desktop App")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(10)) // 10 seconds timeout
                .build();
                
        System.out.println("Request method: " + request.method());
        System.out.println("Request headers: " + request.headers().map());

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Login API response status: " + response.statusCode());
        System.out.println("Login API response headers: " + response.headers().map());
        System.out.println("Login API response body: " + response.body());
        
        // Check if response is valid JSON
        try {
            // If the response is not JSON, it might be an error message
            if (response.statusCode() != 200) {
                throw new IOException("HTTP " + response.statusCode() + ": " + response.body());
            }
            
            JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
            
            // Connect WebSocket after successful login
            if (response.statusCode() == 200 && jsonResponse.has("token")) {
                String token = jsonResponse.get("token").getAsString();
                setAuthToken(token);
                try {
                    if (webSocketClient != null) {
                        webSocketClient.connect(token);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to connect WebSocket: " + e.getMessage());
                }
            }

            return jsonResponse;
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from login API: " + response.body());
            throw new IOException("Invalid JSON response from login API: " + response.body(), e);
        }
    }

    public JsonObject register(String email, String phone, String password, String firstName, String lastName, String address) throws IOException, InterruptedException {
        Map<String, String> userData = new HashMap<>();
        userData.put("email", email);
        userData.put("phone", phone);
        userData.put("password", password);
        userData.put("firstName", firstName);
        userData.put("lastName", lastName);
        userData.put("address", address);

        String requestBody = gson.toJson(userData);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Register API response status: " + response.statusCode());
        System.out.println("Register API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from register API: " + response.body());
            throw e;
        }
    }

    // User endpoints
    public JsonObject getUserProfile() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/users/profile"))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("User profile API response status: " + response.statusCode());
        System.out.println("User profile API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from user profile API: " + response.body());
            throw e;
        }
    }

    // Get all users (admin only)
    public JsonObject getAllUsers() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/users"))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Get all users API response status: " + response.statusCode());
        System.out.println("Get all users API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from get all users API: " + response.body());
            throw e;
        }
    }

    // Emergency endpoints
    public JsonObject createEmergencyAlert(String type, String severity, String description, Map<String, Object> location) throws IOException, InterruptedException {
        Map<String, Object> alertData = new HashMap<>();
        alertData.put("type", type);
        alertData.put("severity", severity);
        alertData.put("description", description);
        alertData.put("location", location);

        String requestBody = gson.toJson(alertData);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/emergencies/alert"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Create emergency alert API response status: " + response.statusCode());
        System.out.println("Create emergency alert API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from emergency alert API: " + response.body());
            throw e;
        }
    }

    // New emergency report endpoint
    public JsonObject createEmergencyReport(Map<String, Object> emergencyData) throws IOException, InterruptedException {
        if (authToken == null || authToken.isEmpty()) {
            throw new IOException("No authentication token available. Please login first.");
        }
        
        String requestBody = gson.toJson(emergencyData);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/emergency/report"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(15)) // 15 seconds timeout
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Create emergency report API response status: " + response.statusCode());
        System.out.println("Create emergency report API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from emergency report API: " + response.body());
            throw new IOException("Invalid JSON response from emergency report API: " + response.body(), e);
        }
    }

    public JsonObject getActiveEmergencies() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/emergencies/active"))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Get active emergencies API response status: " + response.statusCode());
        System.out.println("Get active emergencies API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from active emergencies API: " + response.body());
            throw e;
        }
    }
    
    public JsonObject updateEmergencyStatus(String emergencyId, String status) throws IOException, InterruptedException {
        Map<String, String> statusData = new HashMap<>();
        statusData.put("status", status);

        String requestBody = gson.toJson(statusData);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/emergencies/" + emergencyId))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Update emergency status API response status: " + response.statusCode());
        System.out.println("Update emergency status API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from update emergency status API: " + response.body());
            throw e;
        }
    }
    
    // Get emergency statistics (admin only)
    public JsonObject getEmergencyStatistics() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/emergencies/statistics"))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Get emergency statistics API response status: " + response.statusCode());
        System.out.println("Get emergency statistics API response body: " + response.body());
        
        try {
            return JsonParser.parseString(response.body()).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from get emergency statistics API: " + response.body());
            throw e;
        }
    }
}