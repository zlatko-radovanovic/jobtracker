package com.jobtracker.dto;

import com.jobtracker.model.ApplicationStatus;

import java.time.LocalDate;

public record ApplicationResponse(
        Long id,
        String position,
        ApplicationStatus status,
        LocalDate appliedDate,
        Integer salary,
        String notes,
        Long companyId,
        String companyName) {
}
