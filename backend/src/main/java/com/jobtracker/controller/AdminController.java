package com.jobtracker.controller;

import com.jobtracker.dto.UserSummary;
import com.jobtracker.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Samo korisnici sa ulogom ADMIN (primer autorizacije po ulogama)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserSummary> users() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name()))
                .toList();
    }
}
