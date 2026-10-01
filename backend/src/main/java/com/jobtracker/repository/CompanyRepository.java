package com.jobtracker.repository;

import com.jobtracker.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    // Spring Data sam pravi SQL iz imena metode
    List<Company> findByOwnerUsernameOrderByNameAsc(String username);
    Optional<Company> findByIdAndOwnerUsername(Long id, String username);
}
