package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.AuthenticationRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.AuthenticationResponse;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.RegisterRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForgotPasswordRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ResetPasswordRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.VerifyRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }

        String verificationCode = generateRandomCode();

        Users user = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false) // to be verified via email
                .verificationCode(verificationCode)
                .build();
        userRepository.save(user);

        // TODO: Generate verification code and send via Gmail here
        emailService.send(
                user.getUsername(),
                "Verify Your Account",
                "Your verification code is: " + verificationCode);

        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // Method to verify account by set the enable attributes of user
    public void verifyAccount(VerifyRequest verifyRequest) {
        Users user = userRepository.findByVerificationCode(verifyRequest.getCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code"));

        user.setEnabled(true);
        // TODO: Fix the bug which it doesn't clear the code after verifying
        user.setVerificationCode(null); // After verification, delete the code to not store confidential info
        userRepository.save(user);
    }

    // Method to send the code in order to verify when reset pwd
    public void forgotPassword(ForgotPasswordRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not registered"));

        String resetCode = generateRandomCode();
        user.setResetCode(resetCode);
        userRepository.save(user);

        emailService.send(
                user.getEmail(),
                "Password Reset Request",
                "Your password reset code is: " + resetCode);
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not registered"));

        if (user.getResetCode() == null || !user.getResetCode().equals(request.getCode())) {
            throw new IllegalArgumentException("Invalid reset code");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetCode(null); // Clear reset code after use
        userRepository.save(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    private String generateRandomCode() {
        return String.valueOf((int)(Math.random() * 900000) + 100000); // 6-digit code
    }
}

