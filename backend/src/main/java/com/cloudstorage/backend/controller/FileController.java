package com.cloudstorage.backend.controller;

import com.cloudstorage.backend.model.File;
import com.cloudstorage.backend.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // Upload file
    @PostMapping("/upload")
    public ResponseEntity<File> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        File savedFile = fileService.saveFile(file);
        return ResponseEntity.ok(savedFile);
    }

    // Get normal files
    @GetMapping
    public ResponseEntity<List<File>> getAllFiles() {
        return ResponseEntity.ok(fileService.getAllFiles());
    }

    // Move file to Trash
    @DeleteMapping("/{id}")
    public ResponseEntity<String> moveToTrash(
            @PathVariable Long id
    ) {
        fileService.deleteFile(id);
        return ResponseEntity.ok("File moved to Trash");
    }

    // Get Trash files
    @GetMapping("/trash")
    public ResponseEntity<List<File>> getTrashFiles() {
        return ResponseEntity.ok(fileService.getTrashFiles());
    }

    // Restore file
    @PutMapping("/{id}/restore")
    public ResponseEntity<String> restoreFile(
            @PathVariable Long id
    ) {
        fileService.restoreFile(id);
        return ResponseEntity.ok("File restored successfully");
    }
}