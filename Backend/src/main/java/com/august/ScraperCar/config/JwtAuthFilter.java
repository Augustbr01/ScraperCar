package com.august.ScraperCar.config;

import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.service.authentication.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    private static final List<String> ROTAS_LIBERADAS = List.of(
            "/auth/login",
            "/auth/cadastro",
            "/verify/gerar",
            "/verify/trocar-numero",
            "/verify/status"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return ROTAS_LIBERADAS.contains(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Sem token → deixa passar (Security cuida do 401/403)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extrairEmail(token);


            if (email != null
                    && !email.startsWith("REFRESH_")
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.isTokenValido(token, email)) {

                UserModel user = userRepository.findByEmail(email).orElse(null);
                if (user != null && !user.getVerificado()) {
                    response.setStatus(403);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"Número não verificado\"}");
                    return;
                }

                String role = jwtService.extrairRole(token);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        token,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception _) {
        }

        chain.doFilter(request, response);
    }
}
