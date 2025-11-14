package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.google.gson.stream.JsonReader;
import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class ApiService implements com.haven.services.AuthService, com.haven.services.UserService, com.haven.services.EmergencyService {
    private static final String BASE_URL = (System.getenv("HAVEN_BACKEND_URL") != null ? System.getenv("HAVEN_BACKEND_URL").trim() : "http://localhost:3000").trim();
    private static ApiService instance;
    private HttpClient client;
    private Gson gson;
    private String authToken;
    private WebSocketClient webSocketClient;
    
    public String getBaseUrl() {
        return BASE_URL;
    }

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
                System.err.println("Login failed with status code: " + response.statusCode());
                // For debugging, let's still try to parse the response
                if (response.body() != null && !response.body().trim().isEmpty()) {
                    try {
                        JsonObject errorResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                        System.err.println("Login error response: " + errorResponse.toString());
                    } catch (JsonSyntaxException e) {
                        System.err.println("Login error response is not JSON: " + response.body());
                    }
                }
                throw new IOException("HTTP " + response.statusCode() + ": " + response.body());
            }
            
            JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
            
            // Connect WebSocket after successful login
            if (response.statusCode() == 200 && jsonResponse.has("token")) {
                String token = jsonResponse.get("token").getAsString();
                System.out.println("Setting auth token: " + token);
                setAuthToken(token);
                try {
                    if (webSocketClient != null) {
                        webSocketClient.connect(token);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to connect WebSocket: " + e.getMessage());
                }
            } else {
                System.err.println("Login response does not contain token: " + jsonResponse.toString());
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from register API");
            throw new IOException("Empty response from register API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from register API: " + responseBody);
            throw new IOException("Invalid JSON response from register API: " + responseBody, e);
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from user profile API");
            throw new IOException("Empty response from user profile API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from user profile API: " + responseBody);
            throw new IOException("Invalid JSON response from user profile API: " + responseBody, e);
        }
    }

    // Get all users (admin only)
    public JsonObject getAllUsers() throws IOException, InterruptedException {
        System.out.println("Making request to get all users with auth token: " + authToken);
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/users"))
                .header("Content-Type", "application/json")
                .GET();
                
        // Add authentication header if token is available
        if (authToken != null && !authToken.isEmpty()) {
            requestBuilder.header("Authorization", "Bearer " + authToken);
            System.out.println("Adding authorization header with token: " + authToken);
        } else {
            System.out.println("No auth token available for users request");
        }

        HttpRequest request = requestBuilder.build();
        
        System.out.println("Sending request to: " + request.uri());
        System.out.println("Request headers: " + request.headers().map());

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Get all users API response status: " + response.statusCode());
        System.out.println("Get all users API response body: " + response.body());
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from get all users API");
            return new JsonObject();
        }
        
        // Check if we got an authentication error
        if (response.statusCode() == 401) {
            System.err.println("Authentication required for users API");
            // Try to parse the error response for more details
            try {
                JsonObject errorResponse = JsonParser.parseString(responseBody).getAsJsonObject();
                System.err.println("401 Error details: " + errorResponse.toString());
            } catch (JsonSyntaxException e) {
                System.err.println("401 Error response is not JSON: " + responseBody);
            }
            return new JsonObject();
        }
        
        if (response.statusCode() == 403) {
            System.err.println("Access denied - admin privileges required for users API");
            // Try to parse the error response for more details
            try {
                JsonObject errorResponse = JsonParser.parseString(responseBody).getAsJsonObject();
                System.err.println("403 Error details: " + errorResponse.toString());
            } catch (JsonSyntaxException e) {
                System.err.println("403 Error response is not JSON: " + responseBody);
            }
            return new JsonObject();
        }
        
        // Check if the response contains an error message instead of JSON
        if (responseBody.contains("Invalid Upgrade header") || responseBody.contains("Upgrade Required")) {
            System.err.println("Server returned WebSocket upgrade error instead of JSON data");
            // Return an empty JSON object to avoid parsing errors
            return new JsonObject();
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from get all users API: " + responseBody);
            // Return an empty JSON object to avoid breaking the application
            return new JsonObject();
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from emergency alert API");
            throw new IOException("Empty response from emergency alert API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from emergency alert API: " + responseBody);
            throw new IOException("Invalid JSON response from emergency alert API: " + responseBody, e);
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from emergency report API");
            throw new IOException("Empty response from emergency report API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from emergency report API: " + responseBody);
            throw new IOException("Invalid JSON response from emergency report API: " + responseBody, e);
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from active emergencies API");
            throw new IOException("Empty response from active emergencies API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from active emergencies API: " + responseBody);
            throw new IOException("Invalid JSON response from active emergencies API: " + responseBody, e);
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from update emergency status API");
            throw new IOException("Empty response from update emergency status API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from update emergency status API: " + responseBody);
            throw new IOException("Invalid JSON response from update emergency status API: " + responseBody, e);
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
        
        // Check if the response is valid JSON
        String responseBody = response.body();
        if (responseBody == null || responseBody.trim().isEmpty()) {
            System.err.println("Empty response from get emergency statistics API");
            throw new IOException("Empty response from get emergency statistics API");
        }
        
        try {
            // Use a lenient JSON parser to handle malformed JSON
            JsonReader reader = new JsonReader(new StringReader(responseBody));
            reader.setLenient(true);
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (JsonSyntaxException e) {
            System.err.println("Invalid JSON response from get emergency statistics API: " + responseBody);
            throw new IOException("Invalid JSON response from get emergency statistics API: " + responseBody, e);
        }
    }
    
    // Test backend connection
    public boolean testConnection() {
        try {
            System.out.println("Testing connection to backend at: " + BASE_URL);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/api/v1/auth/login"))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Connection test response status: " + response.statusCode());
            // For login endpoint, we expect 405 (Method Not Allowed) which means the server is running
            return response.statusCode() == 405 || response.statusCode() == 200;
        } catch (Exception e) {
            System.err.println("Connection test failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
