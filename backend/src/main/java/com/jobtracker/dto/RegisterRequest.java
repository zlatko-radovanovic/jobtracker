package com.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Korisničko ime je obavezno")
        @Size(min = 3, max = 50, message = "Korisničko ime mora imati 3 do 50 karaktera")
        String username,

        @NotBlank(message = "Email je obavezan")
        @Email(message = "Email nije u ispravnom formatu")
        String email,

        @NotBlank(message = "Lozinka je obavezna")
        @Size(min = 6, max = 100, message = "Lozinka mora imati najmanje 6 karaktera")
        String password) {
}
