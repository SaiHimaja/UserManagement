package com.usermvp.demo.service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.usermvp.demo.repository.UserRepository;

@Service

public class ImageCleanUpService {

    @Value("${app.upload.dir:/demo/uploads}")
    private String uploadDir;

    private final UserRepository userRepository;



    public ImageCleanUpService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<String> findAndDeleteOrphanImages() {
        // 1. Get DB referenced image URLs (remove /uploads/ prefix)
        List<String> dbImages = userRepository.findAllImageUrls()
            .stream()
            .map(url -> url.replace("/uploads/", ""))
            .collect(Collectors.toList());

        // 2. List files on disk
        File folder = new File(uploadDir);
        String[] storedFiles = folder.list();

        List<String> deletedFiles = new ArrayList<>();
        if (storedFiles != null) {
            for (String fileName : storedFiles) {
                if (!dbImages.contains(fileName)) {
                    File orphanFile = new File(folder, fileName);
                    if (orphanFile.delete()) {
                        deletedFiles.add(fileName);
                    }
                }
            }
        }
        return deletedFiles;
    }
}
