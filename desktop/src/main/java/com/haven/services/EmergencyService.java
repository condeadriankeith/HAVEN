package com.haven.services;

import com.google.gson.JsonObject;
import java.io.IOException;
import java.util.Map;

/**
 * Service interface for emergency operations
 */
public interface EmergencyService {
    JsonObject createEmergencyAlert(String type, String severity, String description, Map<String, Object> location) throws IOException, InterruptedException;
    JsonObject createEmergencyReport(Map<String, Object> emergencyData) throws IOException, InterruptedException;
    JsonObject getActiveEmergencies() throws IOException, InterruptedException;
    JsonObject updateEmergencyStatus(String emergencyId, String status) throws IOException, InterruptedException;
    JsonObject getEmergencyStatistics() throws IOException, InterruptedException;
}