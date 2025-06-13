package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;
    private String name;
    private String role = "USER";
    @Builder.Default
    private boolean enabled = false;
    private String phoneNumber;
    private String verificationCode;
    private String resetCode;

    // Health info
    private String gender;
    private Boolean asthma;
    private Boolean respiratoryDisease;
    private Boolean heartDisease;
    private Boolean allergies;
    private Boolean pregnant;
    private Boolean smoker;
    private String otherConditions;

    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "users")
    @JsonIgnore
    private List<UserPreferences> userPreferences;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}

