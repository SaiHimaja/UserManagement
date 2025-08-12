package com.usermvp.demo.repository;

import com.usermvp.demo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    boolean existsByEmail(String email);

    @Query("SELECT u.imageUrl FROM User u WHERE u.imageUrl IS NOT NULL")
    List<String> findAllImageUrls();
}
