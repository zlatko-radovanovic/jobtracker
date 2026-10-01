package com.jobtracker.service;

import com.jobtracker.dto.ApplicationRequest;
import com.jobtracker.dto.ApplicationResponse;
import com.jobtracker.dto.PageResponse;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.AppUser;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ApplicationService(JobApplicationRepository applicationRepository,
                              CompanyRepository companyRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> search(String username, ApplicationStatus status,
                                                    String search, Pageable pageable) {
        Specification<JobApplication> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Uvek samo prijave ulogovanog korisnika
            predicates.add(cb.equal(root.get("owner").get("username"), username));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("position")), like),
                        cb.like(cb.lower(root.join("company", JoinType.LEFT).get("name")), like)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return PageResponse.from(applicationRepository.findAll(spec, pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public ApplicationResponse findById(String username, Long id) {
        return toResponse(getOwned(username, id));
    }

    @Transactional
    public ApplicationResponse create(String username, ApplicationRequest request) {
        AppUser owner = userRepository.findByUsername(username).orElseThrow();
        JobApplication application = new JobApplication();
        application.setOwner(owner);
        apply(application, username, request);
        return toResponse(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationResponse update(String username, Long id, ApplicationRequest request) {
        JobApplication application = getOwned(username, id);
        apply(application, username, request);
        return toResponse(applicationRepository.save(application));
    }

    @Transactional
    public void delete(String username, Long id) {
        applicationRepository.delete(getOwned(username, id));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> stats(String username) {
        // Svi statusi su u rezultatu (i oni sa 0), da grafikon uvek ima sve stubce
        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) {
            counts.put(s, 0L);
        }
        for (Object[] row : applicationRepository.countByStatus(username)) {
            counts.put((ApplicationStatus) row[0], (Long) row[1]);
        }

        Map<String, Long> result = new LinkedHashMap<>();
        counts.forEach((status, count) -> result.put(status.name(), count));
        return result;
    }

    private JobApplication getOwned(String username, Long id) {
        return applicationRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResourceNotFoundException("Prijava sa id=" + id + " ne postoji"));
    }

    private void apply(JobApplication application, String username, ApplicationRequest request) {
        // Firma mora postojati I pripadati istom korisniku
        Company company = companyRepository.findByIdAndOwnerUsername(request.companyId(), username)
                .orElseThrow(() -> new ResourceNotFoundException("Firma sa id=" + request.companyId() + " ne postoji"));

        application.setPosition(request.position().trim());
        application.setCompany(company);
        application.setStatus(request.status());
        application.setAppliedDate(request.appliedDate());
        application.setSalary(request.salary());
        application.setNotes(request.notes());
    }

    private ApplicationResponse toResponse(JobApplication a) {
        return new ApplicationResponse(
                a.getId(),
                a.getPosition(),
                a.getStatus(),
                a.getAppliedDate(),
                a.getSalary(),
                a.getNotes(),
                a.getCompany().getId(),
                a.getCompany().getName());
    }
}
