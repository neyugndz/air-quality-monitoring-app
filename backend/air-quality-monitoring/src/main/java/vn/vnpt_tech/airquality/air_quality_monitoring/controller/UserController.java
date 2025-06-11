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

    /**
     * Update the entire user profile
     * This method will update all fields of the user profile.
     * @param userId The ID of the user to update
     * @param userDTO Data transfer object containing user details to be updated
     * @return ResponseEntity with the updated user object, or error message if any exception occurs
     */

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody UserDTO userDTO) {
        try {
            Users updatedUser = userService.updateUserProfile(userId, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating user profile: " + e.getMessage());
        }
    }

    /**
     * Update user preferences completely
     * This method updates all preferences (e.g., language, notification settings).
     * @param userId The ID of the user whose preferences are to be updated
     * @param preferencesDTO Data transfer object containing preferences to be updated
     * @return ResponseEntity with the updated preferences object, or error message if any exception occurs
     */
    @PutMapping("/{userId}/preferences")
    public ResponseEntity<?> updateUserPreferences(@PathVariable Long userId, @RequestBody UserPreferencesDTO preferencesDTO) {
        try {
            UserPreferences updatedPreferences = userService.updateUserPreferences(userId, preferencesDTO);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating user preferences: " + e.getMessage());
        }
    }


    /**
     * Partially update the user profile
     * This method allows for partial updates. Only the fields provided in the userDTO will be updated.
     * @param userId The ID of the user to partially update
     * @param userDTO Data transfer object containing fields to update
     * @return ResponseEntity with the updated user object, or error message if any exception occurs
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<?> patchUserProfile(@PathVariable Long userId, @RequestBody UserDTO userDTO) {
        try {
            Users updatedUser = userService.patchUserProfile(userId, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error patching user profile: " + e.getMessage());
        }
    }

    /**
     * Partially update user preferences
     * This method allows for partial updates to the user's preferences. Only the fields provided in the preferencesDTO will be updated.
     * @param userId The ID of the user whose preferences are to be updated
     * @param preferencesDTO Data transfer object containing preferences to update
     * @return ResponseEntity with the updated preferences object, or error message if any exception occurs
     */
    @PatchMapping("/{userId}/preferences")
    public ResponseEntity<?> patchUserPreferences(@PathVariable Long userId, @RequestBody UserPreferencesDTO preferencesDTO) {
        try {
            UserPreferences updatedPreferences = userService.patchUserPreferences(userId, preferencesDTO);
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

    private UserDTO getUserDTO(Optional<Users> optionalUsers) {
        Users user = optionalUsers.get();

        UserDTO userDTO = new UserDTO(
                user.getEmail(),
                user.getName(),
                user.getDateOfBirth(),
                user.getGender(),
                user.getHeightCm(),
                user.getWeightKg(),
                user.getAsthma(),
                user.getRespiratoryDisease(),
                user.getHeartDisease(),
                user.getAllergies(),
                user.getPregnant(),
                user.getSmoker(),
                user.getOtherConditions()
        );
        return userDTO;
    }

}
