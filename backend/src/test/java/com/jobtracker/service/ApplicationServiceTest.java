package com.jobtracker.service;

import com.jobtracker.dto.ApplicationRequest;
import com.jobtracker.dto.ApplicationResponse;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.AppUser;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.Role;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationService service;

    private ApplicationRequest request() {
        return new ApplicationRequest("Java Developer", 1L, ApplicationStatus.APPLIED,
                LocalDate.of(2026, 1, 15), 3000, "Poslat CV");
    }

    @Test
    void createSavesApplicationForExistingCompany() {
        AppUser user = new AppUser("marko", "m@m.com", "hash", Role.USER);
        Company company = new Company();
        company.setId(1L);
        company.setName("Acme");

        when(userRepository.findByUsername("marko")).thenReturn(Optional.of(user));
        when(companyRepository.findByIdAndOwnerUsername(1L, "marko")).thenReturn(Optional.of(company));
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        ApplicationResponse response = service.create("marko", request());

        assertEquals("Java Developer", response.position());
        assertEquals("Acme", response.companyName());
        assertEquals(ApplicationStatus.APPLIED, response.status());
        verify(applicationRepository).save(any(JobApplication.class));
    }

    @Test
    void createThrowsWhenCompanyDoesNotBelongToUser() {
        when(userRepository.findByUsername("marko"))
                .thenReturn(Optional.of(new AppUser("marko", "m@m.com", "hash", Role.USER)));
        when(companyRepository.findByIdAndOwnerUsername(1L, "marko")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.create("marko", request()));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void findByIdThrowsWhenNotFound() {
        when(applicationRepository.findByIdAndOwnerUsername(99L, "marko")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById("marko", 99L));
    }

    @Test
    void statsContainsAllStatusesWithZeroDefaults() {
        List<Object[]> rows = List.<Object[]>of(
                new Object[]{ApplicationStatus.APPLIED, 3L},
                new Object[]{ApplicationStatus.OFFER, 1L});
        when(applicationRepository.countByStatus("marko")).thenReturn(rows);

        Map<String, Long> stats = service.stats("marko");

        assertEquals(4, stats.size());
        assertEquals(3L, stats.get("APPLIED"));
        assertEquals(0L, stats.get("INTERVIEW"));
        assertEquals(1L, stats.get("OFFER"));
        assertEquals(0L, stats.get("REJECTED"));
    }
}
