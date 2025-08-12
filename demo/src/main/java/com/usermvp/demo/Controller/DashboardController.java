package com.usermvp.demo.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermvp.demo.repository.UserRepository;
import com.usermvp.demo.model.User;

@RestController
@RequestMapping("/dashboard")

public class DashboardController {

    @Autowired UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String,Object>> getUserInfo(Authentication authentication) {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Optional<User>userOptional = userRepository.findByEmail(email);
       if (userOptional.isPresent()) {
        // Redirect to front-end dashboard if user exists
        return ResponseEntity.status(HttpStatus.FOUND)  // 302 redirect
                .header("Location", "http://localhost:3000/login")
                .build();


        } else{
            return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
            .header("Location","http://localhost:3000/complete-profile?email="+email+"&name="+name)

            .build();
        }
    }
}
