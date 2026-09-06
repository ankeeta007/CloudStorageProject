package com.cloudstorage.backend.controller;

import com.cloudstorage.backend.model.Folder;
import com.cloudstorage.backend.service.FolderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "http://localhost:3000")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<Folder> createFolder(
            @RequestParam String folderName
    ) {
        return ResponseEntity.ok(
                folderService.createFolder(folderName)
        );
    }

    @GetMapping
    public ResponseEntity<List<Folder>> getAllFolders() {
        return ResponseEntity.ok(
                folderService.getAllFolders()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Folder> getFolderById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                folderService.getFolderById(id)
        );
    }
}