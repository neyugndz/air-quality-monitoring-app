package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.AuthenticationRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.AuthenticationResponse;
import vn.vnpt_tech.airquality.air_quality_monitoring.auth.RegisterRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForgotPasswordRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ResetPasswordRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.VerifyRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody VerifyRequest request) {
        authService.verifyAccount(request);
        return ResponseEntity.ok("Account verified successfully");
    }

    @PostMapping("/forgot-pwd")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Password reset code sent to your email.");
    }

    @PostMapping("/reset-pwd")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }
}
