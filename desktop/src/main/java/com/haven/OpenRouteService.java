package com.haven;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

public class OpenRouteService {
    private static final String API_KEY = System.getenv("OPENROUTESERVICE_API_KEY") != null ? 
        System.getenv("OPENROUTESERVICE_API_KEY") : 
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjhlMGM5ZWEyNzdmNTRmMWZhN2I2ODk3YmQ3MGZjOTEyIiwiaCI6Im11cm11cjY0In0="; // Default API key
    private static final String DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
    private static final String MATRIX_URL = "https://api.openrouteservice.org/v2/matrix/driving-car";
    
    private final HttpClient client;
    private final Gson gson;
    
    // Vet hub location (SM City Bacolod)
    private static final double VET_HUB_LAT = 10.6722;
    private static final double VET_HUB_LNG = 122.9443;
    
    private static OpenRouteService instance;
    
    private OpenRouteService() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.gson = new Gson();
    }
    
    public static synchronized OpenRouteService getInstance() {
        if (instance == null) {
            instance = new OpenRouteService();
        }
        return instance;
    }
    
    /**
     * Calculate the shortest path between the vet hub and an emergency location
     * @param emergencyLat Latitude of the emergency location
     * @param emergencyLng Longitude of the emergency location
     * @return Array of coordinates representing the route, or null if failed
     * @throws IOException
     * @throws InterruptedException
     */
    public double[][] calculateShortestPath(double emergencyLat, double emergencyLng) throws IOException, InterruptedException {
        // Check if API key is properly configured
        if (API_KEY == null || API_KEY.equals("YOUR_API_KEY_HERE")) {
            System.err.println("OpenRouteService API key is not configured properly");
            return null;
        }
        
        try {
            // Create the request body
            JsonObject requestBody = new JsonObject();
            
            JsonArray coordinates = new JsonArray();
            JsonArray startPoint = new JsonArray();
            startPoint.add(VET_HUB_LNG); // longitude first for OpenRouteService
            startPoint.add(VET_HUB_LAT); // then latitude
            coordinates.add(startPoint);
            
            JsonArray endPoint = new JsonArray();
            endPoint.add(emergencyLng); // longitude first for OpenRouteService
            endPoint.add(emergencyLat); // then latitude
            coordinates.add(endPoint);
            
            requestBody.add("coordinates", coordinates);
            requestBody.addProperty("geometry", "true");
            requestBody.addProperty("instructions", "false");
            requestBody.addProperty("units", "km");
            
            String requestBodyString = gson.toJson(requestBody);
            
            System.out.println("Making OpenRouteService directions request with body: " + requestBodyString);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(DIRECTIONS_URL))
                    .header("Authorization", API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyString))
                    .timeout(Duration.ofSeconds(15))
                    .build();
                    
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("OpenRouteService directions response status: " + response.statusCode());
            // Only print the first 500 characters of the response body to avoid flooding the logs
            String responseBody = response.body();
            System.out.println("OpenRouteService directions response body: " + (responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody));
            
            if (response.statusCode() == 200) {
                JsonObject jsonResponse = JsonParser.parseString(responseBody).getAsJsonObject();
                
                // Extract routes from the response
                if (jsonResponse.has("routes")) {
                    JsonArray routes = jsonResponse.getAsJsonArray("routes");
                    if (routes.size() > 0) {
                        JsonObject route = routes.get(0).getAsJsonObject();
                        
                        // Extract geometry (encoded polyline)
                        if (route.has("geometry")) {
                            String encodedPolyline = route.get("geometry").getAsString();
                            System.out.println("Encoded polyline: " + encodedPolyline);
                            
                            // Decode the polyline to get actual coordinates
                            double[][] coordinatesArray = decodePolyline(encodedPolyline);
                            System.out.println("Decoded coordinates array length: " + coordinatesArray.length);
                            
                            return coordinatesArray;
                        } else {
                            System.err.println("No geometry found in the route");
                        }
                    } else {
                        System.err.println("No routes found in the response");
                    }
                } else {
                    System.err.println("No routes key in the response");
                }
            } else {
                System.err.println("OpenRouteService directions request failed with status: " + response.statusCode());
                System.err.println("Response body: " + responseBody);
            }
        } catch (Exception e) {
            System.err.println("Error calculating shortest path: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Decode a Google Maps encoded polyline string into an array of coordinates
     * @param encoded Encoded polyline string
     * @return Array of [latitude, longitude] coordinates
     */
    private double[][] decodePolyline(String encoded) {
        try {
            System.out.println("Decoding polyline: " + encoded);
            
            // Handle empty or null encoded string
            if (encoded == null || encoded.isEmpty()) {
                System.err.println("Empty encoded polyline");
                // Return a simple straight line
                double[][] result = new double[2][2];
                result[0][0] = VET_HUB_LAT;
                result[0][1] = VET_HUB_LNG;
                result[1][0] = 10.666640307729258; // Default emergency lat
                result[1][1] = 122.99316345507782; // Default emergency lng
                return result;
            }
            
            // Parse the encoded polyline
            int len = encoded.length();
            int index = 0;
            int lat = 0;
            int lng = 0;
            
            // Count the number of points first
            int count = 0;
            int tempIndex = 0;
            int tempLat = 0;
            int tempLng = 0;
            
            while (tempIndex < len) {
                // Decode latitude
                int shift = 0;
                int result = 0;
                int b;
                do {
                    b = encoded.charAt(tempIndex++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                tempLat += dlat;
                
                // Decode longitude
                shift = 0;
                result = 0;
                do {
                    b = encoded.charAt(tempIndex++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                tempLng += dlng;
                
                count++;
            }
            
            System.out.println("Number of points in polyline: " + count);
            
            // Create array for coordinates
            double[][] coordinates = new double[count][2];
            
            // Reset variables for actual decoding
            index = 0;
            lat = 0;
            lng = 0;
            int pointIndex = 0;
            
            while (index < len) {
                // Decode latitude
                int shift = 0;
                int result = 0;
                int b;
                do {
                    b = encoded.charAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lat += dlat;
                
                // Decode longitude
                shift = 0;
                result = 0;
                do {
                    b = encoded.charAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lng += dlng;
                
                // Convert from E5 format (1e-5) to decimal degrees
                double latitude = lat * 1e-5;
                double longitude = lng * 1e-5;
                
                coordinates[pointIndex][0] = latitude;  // latitude
                coordinates[pointIndex][1] = longitude; // longitude
                pointIndex++;
                
                System.out.println("Point " + pointIndex + ": [" + latitude + ", " + longitude + "]");
            }
            
            System.out.println("Successfully decoded " + pointIndex + " points from polyline");
            return coordinates;
        } catch (Exception e) {
            System.err.println("Error decoding polyline: " + e.getMessage());
            e.printStackTrace();
            
            // Return a simple straight line as fallback
            double[][] result = new double[2][2];
            result[0][0] = VET_HUB_LAT;
            result[0][1] = VET_HUB_LNG;
            result[1][0] = 10.666640307729258; // Default emergency lat
            result[1][1] = 122.99316345507782; // Default emergency lng
            return result;
        }
    }
    
    /**
     * Calculate the distance between the vet hub and an emergency location
     * @param emergencyLat Latitude of the emergency location
     * @param emergencyLng Longitude of the emergency location
     * @return Distance in kilometers, or -1 if failed
     * @throws IOException
     * @throws InterruptedException
     */
    public double calculateDistance(double emergencyLat, double emergencyLng) throws IOException, InterruptedException {
        // Check if API key is properly configured
        if (API_KEY == null || API_KEY.equals("YOUR_API_KEY_HERE")) {
            System.err.println("OpenRouteService API key is not configured properly");
            return -1;
        }
        
        try {
            // Create the request body for matrix API
            JsonObject requestBody = new JsonObject();
            
            JsonArray locations = new JsonArray();
            JsonArray vetHubPoint = new JsonArray();
            vetHubPoint.add(VET_HUB_LNG); // longitude first for OpenRouteService
            vetHubPoint.add(VET_HUB_LAT); // then latitude
            locations.add(vetHubPoint);
            
            JsonArray emergencyPoint = new JsonArray();
            emergencyPoint.add(emergencyLng); // longitude first for OpenRouteService
            emergencyPoint.add(emergencyLat); // then latitude
            locations.add(emergencyPoint);
            
            requestBody.add("locations", locations);
            
            JsonArray metrics = new JsonArray();
            metrics.add("distance");
            requestBody.add("metrics", metrics);
            requestBody.addProperty("units", "km");
            
            String requestBodyString = gson.toJson(requestBody);
            
            System.out.println("Making OpenRouteService matrix request with body: " + requestBodyString);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(MATRIX_URL))
                    .header("Authorization", API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyString))
                    .timeout(Duration.ofSeconds(15))
                    .build();
                    
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("OpenRouteService matrix response status: " + response.statusCode());
            System.out.println("OpenRouteService matrix response body: " + response.body());
            
            if (response.statusCode() == 200) {
                JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                
                // Extract distance from the response
                JsonArray distances = jsonResponse.getAsJsonArray("distances");
                if (distances.size() > 0) {
                    JsonArray row = distances.get(0).getAsJsonArray();
                    if (row.size() > 1) {
                        return row.get(1).getAsDouble(); // Distance from vet hub to emergency location
                    }
                }
            } else {
                System.err.println("OpenRouteService matrix request failed with status: " + response.statusCode());
                System.err.println("Response body: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Error calculating distance: " + e.getMessage());
            e.printStackTrace();
        }
        
        return -1;
    }
    
    /**
     * Calculate the emergency response fee based on distance
     * @param distanceKm Distance in kilometers
     * @return Fee in Philippine Pesos
     */
    public int calculateEmergencyFee(double distanceKm) {
        if (distanceKm <= 0) {
            return 0;
        } else if (distanceKm <= 5) {
            return 500;  // ₱500 for 0–5 km
        } else if (distanceKm <= 10) {
            return 750;  // ₱750 for 5–10 km
        } else if (distanceKm <= 15) {
            return 1000; // ₱1,000 for 10–15 km
        } else if (distanceKm <= 20) {
            return 1500; // ₱1,500 for 15–20 km
        } else {
            return 2000; // ₱2,000 for 20 km and above
        }
    }
}