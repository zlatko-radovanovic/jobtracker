package com.jobtracker.service;

import com.jobtracker.dto.AuthResponse;
import com.jobtracker.dto.LoginRequest;
import com.jobtracker.dto.RegisterRequest;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.model.AppUser;
import com.jobtracker.model.Role;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Korisničko ime je već zauzeto");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email je već registrovan");
        }

        // Svaki novi korisnik je USER; ADMIN se ne može dobiti preko registracije
        AppUser user = new AppUser(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.USER);
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user.getUsername(), user.getRole().name()),
                user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        // Baca BadCredentialsException ako podaci nisu tačni (hvata je GlobalExceptionHandler)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        AppUser user = userRepository.findByUsername(request.username()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user.getUsername(), user.getRole().name()),
                user.getUsername(), user.getRole().name());
    }
}
