//package vn.vnpt_tech.airquality.air_quality_monitoring.controller;
//
//import org.springframework.http.*;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.*;
//
//@RestController
//@CrossOrigin(origins = "http://localhost:3000")
//@RequestMapping("/api/superset")
//public class SupersetController {
//    private final String SUPERSET_API = "http://192.168.88.171:8088";
//    private final String SUPERSET_USER = "admin";  // Your Superset username
//    private final String SUPERSET_PASS = "Dangnguyen1809";  // Your Superset password
//    private final String DASHBOARD_ID = "1";  // Your Superset dashboard ID
//
//    private RestTemplate restTemplate = new RestTemplate();
//
//    @PostMapping("/get-guest-token")
//    public ResponseEntity<Map<String, String>> getGuestToken() {
//        try {
//            // 1. Login to Superset API to get access token
//            Map<String, Object> loginBody = new HashMap<>();
//            loginBody.put("provider", "db");
//            loginBody.put("username", SUPERSET_USER);
//            loginBody.put("password", SUPERSET_PASS);
//            loginBody.put("refresh", true);
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_JSON);
//            HttpEntity<Map<String, Object>> loginRequest = new HttpEntity<>(loginBody, headers);
//
//            ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
//                    SUPERSET_API + "/api/v1/security/login",
//                    loginRequest,
//                    Map.class);
//
//            if (!loginResponse.getStatusCode().is2xxSuccessful()) {
//                return ResponseEntity.status(loginResponse.getStatusCode()).build();
//            }
//
//            String accessToken = (String) loginResponse.getBody().get("access_token");
//
//            // 2. Prepare guest token request body
//            Map<String, Object> guestBody = new HashMap<>();
//            List<Map<String, Object>> resources = new ArrayList<>();
//            Map<String, Object> resource = new HashMap<>();
//            resource.put("type", "dashboard");
//            resource.put("id", DASHBOARD_ID);
//            resources.add(resource);
//
//            guestBody.put("resources", resources);
//            guestBody.put("rls", new ArrayList<>());  // Add RLS filters if needed
//
//            Map<String, String> userMap = new HashMap<>();
//            userMap.put("username", "guest_user");
//            userMap.put("first_name", "Guest");
//            userMap.put("last_name", "User");
//
//            guestBody.put("user", userMap);
//
//            HttpHeaders guestHeaders = new HttpHeaders();
//            guestHeaders.setContentType(MediaType.APPLICATION_JSON);
//            guestHeaders.setBearerAuth(accessToken);
//
//            HttpEntity<Map<String, Object>> guestRequest = new HttpEntity<>(guestBody, guestHeaders);
//
//            ResponseEntity<Map> guestResponse = restTemplate.postForEntity(
//                    SUPERSET_API + "/api/v1/security/guest_token/",
//                    guestRequest,
//                    Map.class);
//
//            if (!guestResponse.getStatusCode().is2xxSuccessful()) {
//                return ResponseEntity.status(guestResponse.getStatusCode()).build();
//            }
//
//            String guestToken = (String) guestResponse.getBody().get("token");
//            Map<String, String> response = new HashMap<>();
//            response.put("token", guestToken);
//
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Collections.singletonMap("error", "Failed to get guest token"));
//        }
//    }
//}
