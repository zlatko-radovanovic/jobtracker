package com.jobtracker.controller;

import com.jobtracker.dto.CompanyRequest;
import com.jobtracker.dto.CompanyResponse;
import com.jobtracker.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> list(Principal principal) {
        return companyService.findAll(principal.getName());
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(Principal principal, @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public CompanyResponse update(Principal principal, @PathVariable Long id,
                                  @Valid @RequestBody CompanyRequest request) {
        return companyService.update(principal.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        companyService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
