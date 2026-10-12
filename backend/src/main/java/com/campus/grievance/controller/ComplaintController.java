package com.campus.grievance.controller;

import com.campus.grievance.dto.Dtos.*;
import com.campus.grievance.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintCreateRequest req,
            Authentication authentication) {
        String email = authentication.getName();
        ComplaintResponse created = complaintService.createComplaint(req, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Grievance registered successfully with ID: " + created.getTicketId(), created));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(Authentication authentication) {
        String email = authentication.getName();
        List<ComplaintResponse> complaints = complaintService.getUserComplaints(email);
        return ResponseEntity.ok(ApiResponse.ok("User grievances retrieved", complaints));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStats(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> stats = complaintService.getUserStats(email);
        return ResponseEntity.ok(ApiResponse.ok("User grievance stats retrieved", stats));
    }

    @GetMapping("/track/{ticketId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> trackComplaint(@PathVariable String ticketId) {
        ComplaintResponse complaint = complaintService.getComplaintByTicketId(ticketId);
        return ResponseEntity.ok(ApiResponse.ok("Grievance status retrieved", complaint));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintResponse complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.ok("Grievance details retrieved", complaint));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest req,
            Authentication authentication) {
        String email = authentication.getName();
        ComplaintResponse updated = complaintService.addFeedback(id, req, email);
        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted successfully. Thank you!", updated));
    }
}
