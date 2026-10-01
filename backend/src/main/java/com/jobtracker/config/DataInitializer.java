package com.jobtracker.config;

import com.jobtracker.model.AppUser;
import com.jobtracker.model.Role;
import com.jobtracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    // Pri pokretanju pravi admin nalog ako ne postoji (samo za razvoj - u produkciji promeni lozinku!)
    @Bean
    CommandLineRunner createAdmin(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByUsername("admin")) {
                users.save(new AppUser("admin", "admin@jobtracker.local", encoder.encode("admin123"), Role.ADMIN));
            }
        };
    }
}
