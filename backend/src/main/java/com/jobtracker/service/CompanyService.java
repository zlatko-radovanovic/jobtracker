package com.jobtracker.service;

import com.jobtracker.dto.CompanyRequest;
import com.jobtracker.dto.CompanyResponse;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.AppUser;
import com.jobtracker.model.Company;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyRepository companyRepository,
                          JobApplicationRepository applicationRepository,
                          UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll(String username) {
        return companyRepository.findByOwnerUsernameOrderByNameAsc(username).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CompanyResponse create(String username, CompanyRequest request) {
        AppUser owner = userRepository.findByUsername(username).orElseThrow();
        Company company = new Company();
        company.setOwner(owner);
        apply(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(String username, Long id, CompanyRequest request) {
        Company company = getOwned(username, id);
        apply(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public void delete(String username, Long id) {
        Company company = getOwned(username, id);
        if (applicationRepository.existsByCompanyId(id)) {
            throw new BadRequestException("Firma ima prijave. Prvo obriši prijave koje joj pripadaju.");
        }
        companyRepository.delete(company);
    }

    // Vraća firmu samo ako pripada ulogovanom korisniku (sprečava pristup tuđim podacima)
    private Company getOwned(String username, Long id) {
        return companyRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResourceNotFoundException("Firma sa id=" + id + " ne postoji"));
    }

    private void apply(Company company, CompanyRequest request) {
        company.setName(request.name().trim());
        company.setWebsite(request.website());
        company.setCity(request.city());
    }

    private CompanyResponse toResponse(Company c) {
        return new CompanyResponse(c.getId(), c.getName(), c.getWebsite(), c.getCity());
    }
}
