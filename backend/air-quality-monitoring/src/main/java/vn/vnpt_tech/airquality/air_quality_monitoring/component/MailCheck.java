//package vn.vnpt_tech.airquality.air_quality_monitoring.component;
//
//import jakarta.annotation.PostConstruct;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//@Component
//public class MailCheck {
//    @Value("${spring.mail.username:NOT_SET}")
//    private String username;
//
//    @Value("${spring.mail.password:NOT_SET}")
//    private String password;
//
//    @PostConstruct
//    public void check() {
//        System.out.println("Mail Username: " + username);
//        System.out.println("Mail Password: " + (password.equals("NOT_SET") ? "NOT SET" : "SET"));
//    }
//}
