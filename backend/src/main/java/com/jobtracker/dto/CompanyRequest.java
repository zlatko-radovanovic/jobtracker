package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank(message = "Naziv firme je obavezan")
        @Size(max = 100, message = "Naziv može imati najviše 100 karaktera")
        String name,

        @Size(max = 255, message = "Website može imati najviše 255 karaktera")
        String website,

        @Size(max = 100, message = "Grad može imati najviše 100 karaktera")
        String city) {
}
