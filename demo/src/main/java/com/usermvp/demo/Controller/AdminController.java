package com.usermvp.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermvp.demo.service.ImageCleanupProducer;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    private final ImageCleanupProducer imageCleanupProducer;

    public AdminController(ImageCleanupProducer imageCleanupProducer) {
        this.imageCleanupProducer = imageCleanupProducer;
    }

     @PostMapping("/cleanup-images")
    public ResponseEntity<String> triggerImageCleanup() {
        imageCleanupProducer.sendCleanupMessage();
        return ResponseEntity.accepted().body("Image cleanup triggered.");
    }
}
