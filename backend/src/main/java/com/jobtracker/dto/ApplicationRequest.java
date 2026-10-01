package com.jobtracker.dto;

import com.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ApplicationRequest(
        @NotBlank(message = "Pozicija je obavezna")
        @Size(max = 150, message = "Pozicija može imati najviše 150 karaktera")
        String position,

        @NotNull(message = "Firma je obavezna")
        Long companyId,

        @NotNull(message = "Status je obavezan")
        ApplicationStatus status,

        @NotNull(message = "Datum prijave je obavezan")
        LocalDate appliedDate,

        @PositiveOrZero(message = "Plata ne može biti negativna")
        Integer salary,

        @Size(max = 2000, message = "Beleške mogu imati najviše 2000 karaktera")
        String notes) {
}
