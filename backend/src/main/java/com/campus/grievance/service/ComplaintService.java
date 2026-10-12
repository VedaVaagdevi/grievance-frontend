package com.campus.grievance.service;

import com.campus.grievance.dto.Dtos.*;
import com.campus.grievance.exception.GlobalExceptionHandler.BadRequestException;
import com.campus.grievance.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.campus.grievance.model.Category;
import com.campus.grievance.model.Complaint;
import com.campus.grievance.model.Status;
import com.campus.grievance.model.User;
import com.campus.grievance.repository.ComplaintRepository;
import com.campus.grievance.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public ComplaintResponse createComplaint(ComplaintCreateRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Generate unique ticket ID: CMP-YYYY-XXXXX
        int year = LocalDateTime.now().getYear();
        int randomCode = 10000 + new Random().nextInt(90000);
        String ticketId = "CMP-" + year + "-" + randomCode;

        Complaint complaint = new Complaint();
        complaint.setTicketId(ticketId);
        complaint.setTitle(req.getTitle().trim());
        complaint.setDescription(req.getDescription().trim());
        complaint.setCategory(req.getCategory());
        complaint.setLocation(req.getLocation() != null ? req.getLocation().trim() : "Campus");
        complaint.setPriority(req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM");
        complaint.setStatus(Status.PENDING);
        complaint.setUser(user);

        // Auto-assign default department based on category
        complaint.setAssignedDepartment(getDefaultDepartment(req.getCategory()));

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getUserComplaints(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return complaintRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintByTicketId(String ticketId) {
        Complaint complaint = complaintRepository.findByTicketId(ticketId.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No grievance found with Ticket ID: " + ticketId));
        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with ID: " + id));
        return ComplaintResponse.fromEntity(complaint);
    }

    public ComplaintResponse addFeedback(Long id, FeedbackRequest req, String userEmail) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with ID: " + id));

        if (!complaint.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("You are not authorized to submit feedback for this grievance.");
        }

        if (req.getRating() < 1 || req.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        complaint.setFeedbackRating(req.getRating());
        complaint.setFeedbackComment(req.getFeedbackComment());

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints(String search, Status status, Category category) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return complaintRepository.searchComplaints(query, status, category).stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ComplaintResponse updateComplaint(Long id, ComplaintUpdateRequest req) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with ID: " + id));

        if (req.getStatus() != null) {
            complaint.setStatus(req.getStatus());
        }
        if (req.getAssignedDepartment() != null && !req.getAssignedDepartment().isBlank()) {
            complaint.setAssignedDepartment(req.getAssignedDepartment().trim());
        }
        if (req.getAdminRemarks() != null) {
            complaint.setAdminRemarks(req.getAdminRemarks().trim());
        }

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grievance not found with ID: " + id);
        }
        complaintRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getAdminStats() {
        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus(Status.PENDING);
        long inProgress = complaintRepository.countByStatus(Status.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(Status.RESOLVED);
        long rejected = complaintRepository.countByStatus(Status.REJECTED);

        double rate = total > 0 ? ((double) resolved / total) * 100.0 : 0.0;
        rate = Math.round(rate * 10.0) / 10.0;

        Map<String, Long> categoryDistribution = new LinkedHashMap<>();
        for (Category cat : Category.values()) {
            categoryDistribution.put(cat.getDisplayName(), complaintRepository.countByCategory(cat));
        }

        List<ComplaintResponse> recent = complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(total, pending, inProgress, resolved, rejected, rate, categoryDistribution, recent);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        long total = complaintRepository.countByUser(user);
        long pending = complaintRepository.countByUserAndStatus(user, Status.PENDING);
        long inProgress = complaintRepository.countByUserAndStatus(user, Status.IN_PROGRESS);
        long resolved = complaintRepository.countByUserAndStatus(user, Status.RESOLVED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("resolved", resolved);
        return stats;
    }

    private String getDefaultDepartment(Category category) {
        if (category == null) return "Administrative Office";
        return switch (category) {
            case HOSTEL -> "Hostel Administration";
            case CLASSROOM_LAB -> "Academic Infrastructure & IT";
            case TRANSPORT -> "Campus Transport Office";
            case ELECTRICITY_WATER -> "Electrical & Plumbing Cell";
            case CLEANLINESS -> "Sanitation & Housekeeping";
            case MAINTENANCE -> "General Maintenance Dept";
            case OTHER -> "Student Welfare Office";
        };
    }
}
