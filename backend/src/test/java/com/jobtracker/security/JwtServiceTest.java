package com.jobtracker.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "Sm9iVHJhY2tlclN1cGVyVGFqbmlLbGp1Y0tvamlKZVZpc2VPZDMyQmFqdGE=";

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);
        userDetails = User.withUsername("marko").password("x").roles("USER").build();
    }

    @Test
    void generatedTokenContainsUsernameAndIsValid() {
        String token = jwtService.generateToken("marko", "USER");

        assertEquals("marko", jwtService.extractUsername(token));
        assertTrue(jwtService.isValid(token, userDetails));
    }

    @Test
    void tokenForDifferentUserIsNotValid() {
        String token = jwtService.generateToken("petar", "USER");

        assertFalse(jwtService.isValid(token, userDetails));
    }

    @Test
    void expiredTokenThrows() {
        ReflectionTestUtils.setField(jwtService, "expirationMs", -1000L);
        String token = jwtService.generateToken("marko", "USER");

        assertThrows(JwtException.class, () -> jwtService.isValid(token, userDetails));
    }

    @Test
    void tamperedTokenThrows() {
        String token = jwtService.generateToken("marko", "USER");
        String tampered = token.substring(0, token.length() - 3) + "abc";

        assertThrows(JwtException.class, () -> jwtService.extractUsername(tampered));
    }
}
