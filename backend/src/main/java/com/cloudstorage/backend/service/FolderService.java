package com.cloudstorage.backend.service;

import com.cloudstorage.backend.model.Folder;
import com.cloudstorage.backend.repository.FolderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FolderService {

    private final FolderRepository folderRepository;

    public FolderService(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    public Folder createFolder(String folderName) {

        Folder folder = new Folder();

        folder.setFolderName(folderName);
        folder.setCreatedAt(LocalDateTime.now());

        return folderRepository.save(folder);
    }

    public List<Folder> getAllFolders() {
        return folderRepository.findAll();
    }

    public Folder getFolderById(Long id) {
        return folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
    }
}