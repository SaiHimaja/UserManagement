package com.usermvp.demo.Controller;


import com.usermvp.demo.model.User;
import com.usermvp.demo.service.UserService;
import com.usermvp.demo.util.JwtUtil;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;


import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;



@RestController
@RequestMapping("api/users")
public class UserController {


    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    public UserController(UserService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // @PostMapping("/register")
    // public ResponseEntity<?> registerUser(Authentication authentication,@RequestBody Map<String, String> userMap) {
    //     String name = userMap.get("name");
    //     String email = userMap.get("email");
    //     String phone = userMap.get("phone");
    //     String address = userMap.get("address");
    //     String password = userMap.get("password");

    //     if (name == null || email == null || password == null) {
    //         return ResponseEntity.badRequest().body("Name, email and password are required");
    //     }

    //     if (userService.getUserByEmail(email).isPresent()) {
    //         return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
    //     }
    //     if (authentication != null && authentication.isAuthenticated()) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    //             .body(Map.of("error", "You are already logged in"));
    //     }

    //     User newUser = new User();
    //     newUser.setName(name);
    //     newUser.setEmail(email);
    //     newUser.setPhone(phone);
    //     newUser.setAddress(address);
    //     newUser.setPassword(passwordEncoder.encode(password));
    //     newUser.setRole("USER");  // default role

    //     userService.save(newUser);

    //     return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    // }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {

        try{
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOptional = userService.getUserByEmail(email);

        

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("🔍 Logging in user: " + user.getEmail() + " with role: " + user.getRole());
            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtUtil.generateToken(email);
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "role", user.getRole()

                ));
            } 
                else {
                    // User not found
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of(
                                "errors", List.of(Map.of("message", "Invalid email or password"))
                            ));
                }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of(
            "errors", List.of(Map.of("message", "Invalid email or password"))
        ));

    }
    catch (Exception e) {
        e.printStackTrace(); // <- See full error in console
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of(
            "errors", List.of(Map.of("message", "Login failed: " + e.getMessage()))
        ));
    }
}
@GetMapping("/dashboard")
public ResponseEntity<Map<String, String>> dashboard(Authentication authentication) {
    try {
        if (authentication == null) {
            System.out.println("****************");
            System.out.println("Authentication is null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String email = authentication.getName();
        System.out.println("Authenticated user email: " + email);

        Optional<User> userOptional = userService.getUserByEmail(email);

        if (userOptional.isEmpty()) {
            System.out.println("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        User user = userOptional.get();

        Map<String, String> response = new HashMap<>();
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("address", user.getAddress());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "N/A");

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>>getCurrentUser(Authentication authentication){
        String email = authentication.getName();
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(u->{
            Map<String, Object>response = new HashMap<>();
            response.put("id",u.getId());
            response.put("email",u.getEmail());
            response.put("name",u.getName());
            response.put("phone", u.getPhone());     
            response.put("address", u.getAddress()); 
            response.put("imageUrl", 
            (u.getImageUrl() == null || u.getImageUrl().trim().isEmpty()) ? "" : u.getImageUrl());
            response.put("createdAt", u.getCreatedAt());
            response.put("updatedAt",u.getUpdatedAt());
        
            return ResponseEntity.ok(response);
        }).orElseGet(()-> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
        
    }

//    @PostMapping("/complete-profile")
// public ResponseEntity<?> completeProfile(
//     Authentication authentication,
//     @RequestBody Map<String,String> body) {

//     String email;

//     if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
//         System.out.println("OAuth2 attributes: " + oauthUser.getAttributes());
//         email = oauthUser.getAttribute("email");
//     } else {
//         email = authentication.getName();
//     }

//     if (body.containsKey("phone")) {
//         user.setPhone(body.get("phone"));
//     }
//     if (body.containsKey("address")) {
//         user.setAddress(body.get("address"));
//     }

//     userService.save(user);

//     return ResponseEntity.ok(Map.of("message", "Profile completed successfully"));
// }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> updateCurrentUser(
        Authentication authentication,
        @RequestPart(required = false) MultipartFile image,
        @RequestPart(required = false) String name,
        @RequestPart(required = false) String email,
        @RequestPart(required = false) String phone,
        @RequestPart(required = false) String address,
        @RequestPart(required = false) String currentPassword,
        @RequestPart(required = false) String newPassword) {

    String userEmail = authentication.getName();
    Optional<User> optionalUser = userService.getUserByEmail(userEmail);

    if (optionalUser.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    User user = optionalUser.get();

    if (name != null) user.setName(name);
    if (phone != null) user.setPhone(phone);
    if(address!=null) user.setAddress(address);
    if (name != null) user.setName(name);
    if (email != null) user.setEmail(email);

    if (newPassword != null && !newPassword.isEmpty()) {
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
    }

   
if (image != null && !image.isEmpty()) {
    try {
        // Get file extension
        String originalFilename = image.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // SHORT filename that fits in database
        String filename = user.getId() + "_" + System.currentTimeMillis() + extension;
        // Example: "123_1691234567890.png" (about 20 characters)
        
        Path path = Paths.get("uploads", filename);
        
        // Delete old image if exists
        if (user.getImageUrl() != null && !user.getImageUrl().trim().isEmpty()) {
            String oldFilename = user.getImageUrl().replace("/uploads/", "");
            Path oldPath = Paths.get("uploads", oldFilename);
            Files.deleteIfExists(oldPath);
        }
        
        Files.createDirectories(path.getParent());
        Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        user.setImageUrl("/uploads/" + filename);
        
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
    }
}
    userService.save(user);
    return ResponseEntity.ok(user);
}

@GetMapping("/download/{filename}")
public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
    try {
        Path filePath = Paths.get("uploads", filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        
        // Get file content type
        String contentType = null;
        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException ex) {
            System.out.println("Could not determine file type.");
        }
        
        // Default to octet-stream if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(resource);
                
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
}
