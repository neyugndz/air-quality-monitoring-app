    package vn.vnpt_tech.airquality.air_quality_monitoring.service;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import vn.vnpt_tech.airquality.air_quality_monitoring.dto.UserDTO;
    import vn.vnpt_tech.airquality.air_quality_monitoring.dto.UserPreferencesDTO;
    import vn.vnpt_tech.airquality.air_quality_monitoring.entity.UserPreferences;
    import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
    import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserPreferencesRepository;
    import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserRepository;

    import java.util.Optional;

    @Service
    public class UserService {
        @Autowired
        private UserRepository userRepository;

        @Autowired
        private UserPreferencesRepository userPreferencesRepository;

        // Update user profile
        public Users updateUserProfile(Long userId, UserDTO userDTO) {
            Optional<Users> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                Users user = optionalUser.get();
                user.setEmail(userDTO.getEmail());
                user.setName(userDTO.getName());
                user.setPhoneNumber(userDTO.getPhoneNumber());
                user.setGender(userDTO.getGender());
                user.setAsthma(userDTO.getAsthma());
                user.setRespiratoryDisease(userDTO.getRespiratoryDisease());
                user.setHeartDisease(userDTO.getHeartDisease());
                user.setAllergies(userDTO.getAllergies());
                user.setPregnant(userDTO.getPregnant());
                user.setSmoker(userDTO.getSmoker());
                user.setOtherConditions(userDTO.getOtherConditions());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found");
            }
        }

        // Update user preferences completely
        public UserPreferences updateUserPreferences(Long userId, UserPreferencesDTO preferencesDTO) {
            Optional<Users> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                Users user = optionalUser.get();
                Optional<UserPreferences> optionalPreferences = userPreferencesRepository.findByUsers(user);

                // If UserPreferences exists, update it; otherwise, create a new one
                UserPreferences preferences;
                if (optionalPreferences.isPresent()) {
                    preferences = optionalPreferences.get();
                } else {
                    preferences = new UserPreferences();
                    preferences.setUsers(user);
                }

                // Set or update all fields from the DTO
                preferences.setLocationCustomization(preferencesDTO.getLocationCustomization());
                preferences.setDisplayLanguage(preferencesDTO.getDisplayLanguage());
                preferences.setShowPollutionAlerts(preferencesDTO.getShowPollutionAlerts());
                preferences.setShowHealthTips(preferencesDTO.getShowHealthTips());
                preferences.setUseLocation(preferencesDTO.getUseLocation());
                preferences.setEmailAlerts(preferencesDTO.getEmailAlerts());
                preferences.setPushAlerts(preferencesDTO.getPushAlerts());
                preferences.setSmsAlerts(preferencesDTO.getSmsAlerts());
                preferences.setAqiThreshold(preferencesDTO.getAqiThreshold());
                preferences.setNotificationFrequency(preferencesDTO.getNotificationFrequency());

                return userPreferencesRepository.save(preferences);
            } else {
                throw new RuntimeException("User not found");
            }
        }



        // Partial Update user profile
        public Users patchUserProfile(Long userId, UserDTO userDTO) {
            Optional<Users> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                Users user = optionalUser.get();
                if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
                if (userDTO.getName() != null) user.setName(userDTO.getName());
                if (userDTO.getPhoneNumber() != null) user.setPhoneNumber(userDTO.getPhoneNumber());
                if (userDTO.getGender() != null) user.setGender(userDTO.getGender());
                if (userDTO.getAsthma() != null) user.setAsthma(userDTO.getAsthma());
                if (userDTO.getRespiratoryDisease() != null) user.setRespiratoryDisease(userDTO.getRespiratoryDisease());
                if (userDTO.getHeartDisease() != null) user.setHeartDisease(userDTO.getHeartDisease());
                if (userDTO.getAllergies() != null) user.setAllergies(userDTO.getAllergies());
                if (userDTO.getPregnant() != null) user.setPregnant(userDTO.getPregnant());
                if (userDTO.getSmoker() != null) user.setSmoker(userDTO.getSmoker());
                if (userDTO.getOtherConditions() != null) user.setOtherConditions(userDTO.getOtherConditions());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found");
            }
        }

        // Partial Update user preferences
        public UserPreferences patchUserPreferences(Long userId, UserPreferencesDTO preferencesDTO) {
            Optional<Users> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                Users user = optionalUser.get();
                Optional<UserPreferences> optionalPreferences = userPreferencesRepository.findByUsers(user);

                // If UserPreferences exists, update it; otherwise, create a new one
                UserPreferences preferences;
                if (optionalPreferences.isPresent()) {
                    preferences = optionalPreferences.get(); // Update existing preferences
                } else {
                    preferences = new UserPreferences(); // Create new preferences
                    preferences.setUsers(user);
                }

                if (preferencesDTO.getLocationCustomization() != null) {
                    preferences.setLocationCustomization(preferencesDTO.getLocationCustomization());
                }
                if (preferencesDTO.getDisplayLanguage() != null) {
                    preferences.setDisplayLanguage(preferencesDTO.getDisplayLanguage());
                }
                if (preferencesDTO.getShowPollutionAlerts() != null) {
                    preferences.setShowPollutionAlerts(preferencesDTO.getShowPollutionAlerts());
                }
                if (preferencesDTO.getShowHealthTips() != null) {
                    preferences.setShowHealthTips(preferencesDTO.getShowHealthTips());
                }
                if (preferencesDTO.getUseLocation() != null) {
                    preferences.setUseLocation(preferencesDTO.getUseLocation());
                }
                if (preferencesDTO.getEmailAlerts() != null) {
                    preferences.setEmailAlerts(preferencesDTO.getEmailAlerts());
                }
                if (preferencesDTO.getPushAlerts() != null) {
                    preferences.setPushAlerts(preferencesDTO.getPushAlerts());
                }
                if (preferencesDTO.getSmsAlerts() != null) {
                    preferences.setSmsAlerts(preferencesDTO.getSmsAlerts());
                }
                if (preferencesDTO.getAqiThreshold() != null) {
                    preferences.setAqiThreshold(preferencesDTO.getAqiThreshold());
                }
                if (preferencesDTO.getNotificationFrequency() != null) {
                    preferences.setNotificationFrequency(preferencesDTO.getNotificationFrequency());
                }

                // Save the updated or newly created preferences
                return userPreferencesRepository.save(preferences);
            } else {
                throw new RuntimeException("User not found");
            }
        }
    }
