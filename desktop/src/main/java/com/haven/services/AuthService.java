package com.haven.services;

import com.google.gson.JsonObject;
import java.io.IOException;
import java.util.Map;

/**
 * Service interface for authentication operations
 */
public interface AuthService {
    JsonObject login(String email, String password) throws IOException, InterruptedException;
    JsonObject register(String email, String phone, String password, String firstName, String lastName, String address) throws IOException, InterruptedException;
}