package com.usermvp.demo.service;


import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.usermvp.demo.Config.RabbitMQConfig;


@Service
public class ImageCleanupConsumer {

    private final ImageCleanUpService imageCleanupService;

    public ImageCleanupConsumer(ImageCleanUpService imageCleanupService) {
        this.imageCleanupService = imageCleanupService;
    }

    @RabbitListener(queues = RabbitMQConfig.IMAGE_CLEANUP_QUEUE, concurrency =  "3-10")
    public void receiveMessage(String message) {
        System.out.println("🛠 Worker " + Thread.currentThread().getName() + 
        " processing folder: " + " processing cleanup job");

        List<String> deletedFiles = imageCleanupService.findAndDeleteOrphanImages();

        if (deletedFiles.isEmpty()) {
            System.out.println("No orphan images found.");
        } else {
            System.out.println("Deleted orphan images: " + deletedFiles);
        }
    }
}

