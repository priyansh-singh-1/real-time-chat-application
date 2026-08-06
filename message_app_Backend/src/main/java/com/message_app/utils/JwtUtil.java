package com.message_app.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET=  "my-super-secret-key-for-jwt-authentication-256-bit-key";

    private SecretKey getSigninKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username){
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+1000 * 60 *60 *24))
                .signWith(getSigninKey(), Jwts.SIG.HS256)
                .compact();
    }
    public String extractUsername(String token){
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token, String username){
        return username.equals(extractUsername(token))&&!isTokenExpired(token);
    }

    public boolean isTokenExpired(String token){
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigninKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
