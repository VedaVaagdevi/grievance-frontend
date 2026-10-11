package com.campus.grievance.config;

import com.campus.grievance.model.*;
import com.campus.grievance.repository.ComplaintRepository;
import com.campus.grievance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ComplaintRepository complaintRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Seed Administrator
        User admin = new User(
                "System Administrator",
                "admin@campus.edu",
                passwordEncoder.encode("admin123"),
                "+91 9876543210",
                "Admin",
                "Dean Administration Office",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Seed Student User
        User student = new User(
                "Rahul Sharma",
                "student@campus.edu",
                passwordEncoder.encode("student123"),
                "+91 9876543211",
                "Student",
                "B.Tech CSE - 3rd Year",
                Role.ROLE_USER
        );
        student = userRepository.save(student);

        // 3. Seed Faculty User
        User faculty = new User(
                "Dr. Ananya Verma",
                "staff@campus.edu",
                passwordEncoder.encode("staff123"),
                "+91 9876543212",
                "Faculty",
                "Dept of Mechanical Engineering",
                Role.ROLE_USER
        );
        faculty = userRepository.save(faculty);

        // 4. Seed Realistic Grievances across categories
        Complaint c1 = new Complaint(
                "CMP-2026-10101",
                "Water Leakage and Low Pressure in Block-B 3rd Floor",
                "The 3rd floor washrooms in Hostel Block B have significant pipe leakage and no water pressure since yesterday morning.",
                Category.HOSTEL,
                "Hostel Block B, Room 314",
                "HIGH",
                student
        );
        c1.setStatus(Status.IN_PROGRESS);
        c1.setAssignedDepartment("Hostel Administration");
        c1.setAdminRemarks("Plumber assigned on Oct 7. Repairing pipe joint on 3rd floor.");
        complaintRepository.save(c1);

        Complaint c2 = new Complaint(
                "CMP-2026-10102",
                "Garbage bin overflow near Central Library entrance",
                "Waste bins outside the Central Library are completely overflowing and causing foul odor for visitors.",
                Category.CLEANLINESS,
                "Central Library, Ground Floor Entrance",
                "MEDIUM",
                student
        );
        c2.setStatus(Status.RESOLVED);
        c2.setAssignedDepartment("Sanitation & Housekeeping");
        c2.setAdminRemarks("Bins cleared, disinfected, and two additional covered bins placed.");
        c2.setResolvedAt(LocalDateTime.now().minusDays(1));
        c2.setFeedbackRating(5);
        c2.setFeedbackComment("Cleaned very quickly within 2 hours. Appreciate the swift action!");
        complaintRepository.save(c2);

        Complaint c3 = new Complaint(
                "CMP-2026-10103",
                "Frequent power fluctuations and projector issue in Seminar Hall 2",
                "During lectures, the ceiling projector keeps flickering off due to voltage fluctuations in the panel.",
                Category.ELECTRICITY_WATER,
                "Academic Block 1, Seminar Hall 2",
                "URGENT",
                faculty
        );
        c3.setStatus(Status.PENDING);
        c3.setAssignedDepartment("Electrical & Plumbing Cell");
        c3.setAdminRemarks("Ticket forwarded to electrical sub-station supervisor.");
        complaintRepository.save(c3);

        Complaint c4 = new Complaint(
                "CMP-2026-10104",
                "Bus Route 14 morning transit overcrowding and timing delay",
                "Route 14 bus arrived 35 minutes late twice this week, causing students to miss first hour lab attendance.",
                Category.TRANSPORT,
                "Bus Route 14 (South Campus)",
                "MEDIUM",
                student
        );
        c4.setStatus(Status.IN_PROGRESS);
        c4.setAssignedDepartment("Campus Transport Office");
        c4.setAdminRemarks("Contacted bus vendor; extra shuttle deployed starting Monday.");
        complaintRepository.save(c4);

        Complaint c5 = new Complaint(
                "CMP-2026-10105",
                "Air conditioning unit malfunctioning in Computer Lab 3",
                "Central AC cooling in lab 3 is not working, making systems overheat and shut down unexpectedly.",
                Category.CLASSROOM_LAB,
                "IT Complex, Lab 304",
                "HIGH",
                faculty
        );
        c5.setStatus(Status.RESOLVED);
        c5.setAssignedDepartment("Academic Infrastructure & IT");
        c5.setAdminRemarks("AC refrigerant refilled and thermostat recalibrated.");
        c5.setResolvedAt(LocalDateTime.now().minusDays(2));
        c5.setFeedbackRating(4);
        c5.setFeedbackComment("AC is working fine now. Systems running cool.");
        complaintRepository.save(c5);

        Complaint c6 = new Complaint(
                "CMP-2026-10106",
                "Broken window latch and door handle in Lecture Hall LH-102",
                "Window pane rattles loudly when wind blows, distracting classes. Door lock also sticks.",
                Category.MAINTENANCE,
                "Block C, LH-102",
                "LOW",
                faculty
        );
        c6.setStatus(Status.PENDING);
        c6.setAssignedDepartment("General Maintenance Dept");
        c6.setAdminRemarks("Scheduled with carpentry workshop.");
        complaintRepository.save(c6);

        System.out.println("==========================================================");
        System.out.println("SMART COMPLAINT & GRIEVANCE PORTAL: SEED DATA READY");
        System.out.println("Admin login   : admin@campus.edu   / admin123");
        System.out.println("Student login : student@campus.edu / student123");
        System.out.println("Staff login   : staff@campus.edu   / staff123");
        System.out.println("==========================================================");
    }
}
