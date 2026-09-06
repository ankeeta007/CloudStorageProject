package com.cloudstorage.backend.repository;

import com.cloudstorage.backend.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folder, Long> {
}