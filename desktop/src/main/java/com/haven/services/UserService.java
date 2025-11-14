package com.haven.services;

import com.google.gson.JsonObject;
import java.io.IOException;

/**
 * Service interface for user operations
 */
public interface UserService {
    JsonObject getUserProfile() throws IOException, InterruptedException;
    JsonObject getAllUsers() throws IOException, InterruptedException;
}