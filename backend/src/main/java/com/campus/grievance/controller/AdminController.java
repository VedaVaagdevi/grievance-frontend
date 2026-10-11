package com.campus.grievance.controller;

import com.campus.grievance.dto.Dtos.*;
import com.campus.grievance.model.Category;
import com.campus.grievance.model.Status;
import com.campus.grievance.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ComplaintService complaintService;

    public AdminController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Category category) {
        List<ComplaintResponse> complaints = complaintService.getAllComplaints(search, status, category);
        return ResponseEntity.ok(ApiResponse.ok("Complaints retrieved successfully", complaints));
    }

    @PutMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintUpdateRequest req) {
        ComplaintResponse updated = complaintService.updateComplaint(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Grievance updated successfully", updated));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.ok("Grievance deleted successfully", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminStats() {
        DashboardStatsResponse stats = complaintService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard statistics retrieved", stats));
    }
}
