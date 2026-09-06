package com.cloudstorage.backend.service;

import com.cloudstorage.backend.model.File;
import com.cloudstorage.backend.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final SupabaseStorageService supabaseStorageService;

    public FileService(
            FileRepository fileRepository,
            SupabaseStorageService supabaseStorageService
    ) {
        this.fileRepository = fileRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    // Upload file
    public File saveFile(MultipartFile file) {

        try {

            // Upload actual file to Supabase Storage
            String fileUrl = supabaseStorageService.uploadFile(file);

            // Save file information in PostgreSQL
            File newFile = new File();

            newFile.setFileName(file.getOriginalFilename());
            newFile.setFileType(file.getContentType());
            newFile.setFileSize(file.getSize());
            newFile.setFileUrl(fileUrl);
            newFile.setCreatedAt(LocalDateTime.now());
            newFile.setDeleted(false);

            return fileRepository.save(newFile);

        } catch (Exception e) {

            throw new RuntimeException(
                    "File upload failed: " + e.getMessage(),
                    e
            );
        }
    }

    // Get only active files
    public List<File> getAllFiles() {
        return fileRepository.findByDeletedFalse();
    }

    // Move file to Trash
    public void deleteFile(Long id) {

        File file = fileRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("File not found")
                );

        file.setDeleted(true);

        fileRepository.save(file);
    }

    // Get files currently in Trash
    public List<File> getTrashFiles() {
        return fileRepository.findByDeletedTrue();
    }

    // Restore file from Trash
    public void restoreFile(Long id) {

        File file = fileRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("File not found")
                );

        file.setDeleted(false);

        fileRepository.save(file);
    }
}