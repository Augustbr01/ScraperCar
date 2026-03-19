package com.august.ScraperCar.service.authentication;

import com.august.ScraperCar.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(user -> User.builder()
                        .username(user.getEmail())
                        .password(user.getSenha())
                        .roles(user.getRole())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Email não encontrado"));
    }
}
