package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.UserDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.UserPreferencesDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.UserPreferences;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserPreferencesRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.UserService;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    /**
     * Update the entire user profile
     * This method will update all fields of the user profile.
     * @param userPrincipal The authenticated user
     * @param userDTO Data transfer object containing user details to be updated
     * @return ResponseEntity with the updated user object, or error message if any exception occurs
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@AuthenticationPrincipal Users userPrincipal, @RequestBody UserDTO userDTO) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            Users updatedUser = userService.updateUserProfile(userPrincipal.getId(), userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating user profile: " + e.getMessage());
        }
    }

    /**
     * Update user preferences completely
     * This method updates all preferences (e.g., language, notification settings).
     * @param userPrincipal The authenticated user
     * @param preferencesDTO Data transfer object containing preferences to be updated
     * @return ResponseEntity with the updated preferences object, or error message if any exception occurs
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updateUserPreferences(@AuthenticationPrincipal Users userPrincipal, @RequestBody UserPreferencesDTO preferencesDTO) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            UserPreferences updatedPreferences = userService.updateUserPreferences(userPrincipal.getId(), preferencesDTO);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating user preferences: " + e.getMessage());
        }
    }

    /**
     * Partially update the user profile
     * This method allows for partial updates. Only the fields provided in the userDTO will be updated.
     * @param userPrincipal The authenticated user
     * @param userDTO Data transfer object containing fields to update
     * @return ResponseEntity with the updated user object, or error message if any exception occurs
     */
    @PatchMapping("/profile")
    public ResponseEntity<?> patchUserProfile(@AuthenticationPrincipal Users userPrincipal, @RequestBody UserDTO userDTO) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            Users updatedUser = userService.patchUserProfile(userPrincipal.getId(), userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error patching user profile: " + e.getMessage());
        }
    }

    /**
     * Partially update user preferences
     * This method allows for partial updates to the user's preferences. Only the fields provided in the preferencesDTO will be updated.
     * @param userPrincipal The authenticated user
     * @param preferencesDTO Data transfer object containing preferences to update
     * @return ResponseEntity with the updated preferences object, or error message if any exception occurs
     */
    @PatchMapping("/preferences")
    public ResponseEntity<?> patchUserPreferences(@AuthenticationPrincipal Users userPrincipal, @RequestBody UserPreferencesDTO preferencesDTO) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
            }
            UserPreferences updatedPreferences = userService.patchUserPreferences(userPrincipal.getId(), preferencesDTO);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error patching user preferences: " + e.getMessage());
        }
    }
    /**
     * Get the User Information for profile section
     * @param userId ID of the required user
     * @return ResponseEntity with the body of the fetched User Profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserDTO(@AuthenticationPrincipal Users userPrincipal) {
        try {
            Long userId = userPrincipal.getId();

            Optional<Users> optionalUsers = userRepository.findById(userId);

            if (optionalUsers.isPresent()) {
                UserDTO userDTO = getUserDTO(optionalUsers);

                return ResponseEntity.ok(userDTO);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);

        }
    }

    /**
     * Get the Information of User Preferences based on the Token of the Users
     * @param userPrincipal
     * @return
     */
    @GetMapping("/preferences")
    public ResponseEntity<UserPreferencesDTO> getUserPreferencesDTO(@AuthenticationPrincipal Users userPrincipal) {
        try {
            // Retrieve the user preferences based on the authenticated user
            Optional<UserPreferences> userPreferencesOpt = userPreferencesRepository.findByUsers(userPrincipal);

            if (userPreferencesOpt.isPresent()) {
                UserPreferences userPreferences = userPreferencesOpt.get();
                UserPreferencesDTO preferencesDTO = new UserPreferencesDTO(
                        userPreferences.getLocationCustomization(),
                        userPreferences.getDisplayLanguage(),
                        userPreferences.getShowPollutionAlerts(),
                        userPreferences.getShowHealthTips(),
                        userPreferences.getUseLocation(),
                        userPreferences.getEmailAlerts(),
                        userPreferences.getPushAlerts(),
                        userPreferences.getSmsAlerts(),
                        userPreferences.getAqiThreshold(),
                        userPreferences.getNotificationFrequency()
                );
                return ResponseEntity.ok(preferencesDTO);
            } else {
                // If no preferences are found for the user, return 404 or an empty response
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    private UserDTO getUserDTO(Optional<Users> optionalUsers) {
        Users user = optionalUsers.get();

        return new UserDTO(
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber(),
                user.getGender(),
                user.getAsthma(),
                user.getRespiratoryDisease(),
                user.getHeartDisease(),
                user.getAllergies(),
                user.getPregnant(),
                user.getSmoker(),
                user.getOtherConditions()
        );
    }

}
