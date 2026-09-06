package com.cloudstorage.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String uploadFile(MultipartFile file) {

        try {

            if (file == null || file.isEmpty()) {
                throw new RuntimeException("No file selected");
            }

            String originalFileName = file.getOriginalFilename();

            if (originalFileName == null || originalFileName.isBlank()) {
                throw new RuntimeException("File name is missing");
            }

            // Get file extension
            String extension = "";

            int dotIndex = originalFileName.lastIndexOf(".");

            if (dotIndex >= 0) {
                extension = originalFileName.substring(dotIndex);
            }

            // Create unique file name
            String safeFileName = UUID.randomUUID() + extension;

            // Supabase Storage upload URL
            String uploadUrl =
                    supabaseUrl
                            + "/storage/v1/object/"
                            + bucket
                            + "/"
                            + safeFileName;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header(
                            "Content-Type",
                            file.getContentType() != null
                                    ? file.getContentType()
                                    : "application/octet-stream"
                    )
                    .header("x-upsert", "true")
                    .POST(
                            HttpRequest.BodyPublishers.ofByteArray(
                                    file.getBytes()
                            )
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Supabase upload failed. Status: "
                                + response.statusCode()
                                + ", Response: "
                                + response.body()
                );
            }

            // Public URL
            return supabaseUrl
                    + "/storage/v1/object/public/"
                    + bucket
                    + "/"
                    + safeFileName;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Supabase file upload failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}