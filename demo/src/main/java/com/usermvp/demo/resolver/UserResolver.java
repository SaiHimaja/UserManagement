package com.usermvp.demo.resolver;

import com.usermvp.demo.Exception.BadRequestException;
import com.usermvp.demo.model.User;
import com.usermvp.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;


@Controller
public class UserResolver {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserResolver(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @QueryMapping(name="getAllUsers")
    public Map<String,Object> getAllUsers(@Argument int page, @Argument int size, @Argument String search ){
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<User> resultPage;
        if(search!= null && !search.trim().isEmpty()){
            resultPage=userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            resultPage = userRepository.findAll(pageable);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("users", resultPage.getContent());
        response.put("totalCount", resultPage.getTotalElements());

    return response;
    }

    @MutationMapping(name = "registerAdmin")
public User registerAdmin(@Argument String name,
                          @Argument String email,
                          @Argument String password,
                          @Argument String phone,
                          @Argument String address) {

        // 1️⃣ Check for empty fields
       
    User user = new User();
    user.setName(name);
    user.setEmail(email);
    user.setPhone(phone);
    user.setAddress(address);
    user.setRole("ROLE_ADMIN");
   

    if (password != null && !password.isEmpty()) {
        user.setPassword(passwordEncoder.encode(password));
    }

    return userRepository.save(user);
}


    @MutationMapping(name = "registerUser")
    public User registerUser(Authentication authentication, @Argument String name,
    @Argument String email,
    @Argument String password,
    @Argument String phone,
    @Argument String address
   )
   {
    System.out.println("📥 Received registerUser: " + email);
    if (isNullOrBlank(name) || isNullOrBlank(email) || isNullOrBlank(password)
    || isNullOrBlank(phone) || isNullOrBlank(address)) {
       
throw new BadRequestException("All fields are required");
}

 if ( authentication!= null && authentication.isAuthenticated()
        && !(authentication instanceof AnonymousAuthenticationToken)) {
        throw new BadRequestException("You are already logged in. Logout before registering a new account.");
    }

if (userRepository.existsByEmail(email)) {
    throw new BadRequestException("User with this email already exists");
}

// 2️⃣ Password requirements
if (!isValidPassword(password)) {
throw new BadRequestException(
    "Password must be at least 8 characters long, contain an uppercase letter, "
  + "a lowercase letter, a digit, and a special character"
);
}
User user = new User();
user.setName(name);
user.setEmail(email);
user.setPhone(phone);
user.setAddress(address);


if (password != null && !password.isEmpty()) {
user.setPassword(passwordEncoder.encode(password));
}


User saved = userRepository.save(user);
System.out.println("✅ Saved to DB: " + saved.getId() + " | " + saved.getEmail());
return saved;


 }

 private boolean isNullOrBlank(String str){
    return str ==null || str.trim().isEmpty();
 }

 private boolean isValidPassword(String password) {
    String passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
    return password.matches(passwordPattern);
}
}
