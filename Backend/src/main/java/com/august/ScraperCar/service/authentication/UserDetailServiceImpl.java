package com.august.ScraperCar.service.authentication;

import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.service.authentication.RateLimiter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserDetailServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final RateLimiter rateLimiter;

    public UserDetailServiceImpl(UserRepository userRepository, RateLimiter rateLimiter) {
        this.userRepository = userRepository;
        this.rateLimiter = rateLimiter;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // RATE LIMIT ANTES DO BANCO!
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String clientIp = getClientIp(request);

        if (!rateLimiter.tryConsume(clientIp)) {
            throw new RuntimeException("Login rate limited - too many attempts");
        }

        // SÓ BANCO SE OK
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email não encontrado: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getSenha())
                .roles("USER")
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
