package com.usermvp.demo.Handler;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermvp.demo.model.User;
import com.usermvp.demo.repository.UserRepository;
import com.usermvp.demo.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Optional<User> userOptional = userRepository.findByEmail(email);

        String redirectUrl;

        if (userOptional.isPresent()) {
            // User exists: generate JWT and redirect to dashboard
            String token = jwtUtil.generateToken(email);
            redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/dashboard")
                    .queryParam("token", token)
                    .build()
                    .toUriString();
        } else {
            // User doesn't exist: redirect to complete-profile with email and name params
            redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/complete-profile")
                    .queryParam("email", email)
                    .queryParam("name", name)
                    .build()
                    .toUriString();
        }

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
