package com.jobtracker.repository;

import com.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// JpaSpecificationExecutor omogućava dinamičke filtere (status, pretraga) bez ručnog pisanja svih kombinacija upita
public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    Optional<JobApplication> findByIdAndOwnerUsername(Long id, String username);

    boolean existsByCompanyId(Long companyId);

    @Query("SELECT a.status, COUNT(a) FROM JobApplication a WHERE a.owner.username = :username GROUP BY a.status")
    List<Object[]> countByStatus(@Param("username") String username);
}
