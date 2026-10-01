package com.jobtracker.controller;

import com.jobtracker.dto.ApplicationRequest;
import com.jobtracker.dto.ApplicationResponse;
import com.jobtracker.dto.PageResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    // Dozvoljena polja za sortiranje (sprečava sortiranje po proizvoljnim poljima)
    private static final Set<String> SORT_FIELDS = Set.of("appliedDate", "position", "status", "company.name");

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // GET /api/applications?page=0&size=10&sortBy=appliedDate&direction=desc&status=INTERVIEW&search=java
    @GetMapping
    public PageResponse<ApplicationResponse> list(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search) {

        String field = SORT_FIELDS.contains(sortBy) ? sortBy : "appliedDate";
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(field).ascending() : Sort.by(field).descending();
        // Dodatni sort po id-u da redosled bude stabilan kad su vrednosti iste
        sort = sort.and(Sort.by("id").descending());

        int safeSize = Math.min(Math.max(size, 1), 100);
        return applicationService.search(principal.getName(), status, search,
                PageRequest.of(Math.max(page, 0), safeSize, sort));
    }

    @GetMapping("/stats")
    public Map<String, Long> stats(Principal principal) {
        return applicationService.stats(principal.getName());
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(Principal principal, @PathVariable Long id) {
        return applicationService.findById(principal.getName(), id);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(Principal principal,
                                                      @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(Principal principal, @PathVariable Long id,
                                      @Valid @RequestBody ApplicationRequest request) {
        return applicationService.update(principal.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        applicationService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
