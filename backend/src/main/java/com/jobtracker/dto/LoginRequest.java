package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Korisničko ime je obavezno") String username,
        @NotBlank(message = "Lozinka je obavezna") String password) {
}
