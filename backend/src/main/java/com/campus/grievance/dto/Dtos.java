package com.campus.grievance.dto;

import com.campus.grievance.model.Category;
import com.campus.grievance.model.Complaint;
import com.campus.grievance.model.Role;
import com.campus.grievance.model.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Dtos {

    // -------------------------------------------------------------------------
    // AUTH REQUESTS & RESPONSES
    // -------------------------------------------------------------------------
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phone;
        private String userType; // Student, Faculty, Staff
        private String departmentOrHostel;

        public RegisterRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }

        public String getDepartmentOrHostel() { return departmentOrHostel; }
        public void setDepartmentOrHostel(String departmentOrHostel) { this.departmentOrHostel = departmentOrHostel; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private Long id;
        private String fullName;
        private String email;
        private Role role;
        private String userType;
        private String departmentOrHostel;
        private String message;

        public AuthResponse() {}

        public AuthResponse(String token, Long id, String fullName, String email, Role role, String userType, String departmentOrHostel, String message) {
            this.token = token;
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.userType = userType;
            this.departmentOrHostel = departmentOrHostel;
            this.message = message;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }

        public String getDepartmentOrHostel() { return departmentOrHostel; }
        public void setDepartmentOrHostel(String departmentOrHostel) { this.departmentOrHostel = departmentOrHostel; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    // -------------------------------------------------------------------------
    // COMPLAINT REQUESTS
    // -------------------------------------------------------------------------
    public static class ComplaintCreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private Category category;

        private String location;
        private String priority; // LOW, MEDIUM, HIGH, URGENT

        public ComplaintCreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Category getCategory() { return category; }
        public void setCategory(Category category) { this.category = category; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class ComplaintUpdateRequest {
        private Status status;
        private String assignedDepartment;
        private String adminRemarks;

        public ComplaintUpdateRequest() {}

        public Status getStatus() { return status; }
        public void setStatus(Status status) { this.status = status; }

        public String getAssignedDepartment() { return assignedDepartment; }
        public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }

        public String getAdminRemarks() { return adminRemarks; }
        public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }
    }

    public static class FeedbackRequest {
        @NotNull(message = "Rating is required (1-5)")
        private Integer rating;
        private String feedbackComment;

        public FeedbackRequest() {}

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getFeedbackComment() { return feedbackComment; }
        public void setFeedbackComment(String feedbackComment) { this.feedbackComment = feedbackComment; }
    }

    // -------------------------------------------------------------------------
    // COMPLAINT RESPONSE
    // -------------------------------------------------------------------------
    public static class ComplaintResponse {
        private Long id;
        private String ticketId;
        private String title;
        private String description;
        private Category category;
        private String categoryDisplayName;
        private String location;
        private String priority;
        private Status status;
        private String statusDisplayName;
        private String assignedDepartment;
        private String adminRemarks;
        private Integer feedbackRating;
        private String feedbackComment;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;

        // Complainant info
        private Long userId;
        private String userName;
        private String userEmail;
        private String userType;
        private String userDepartmentOrHostel;

        public ComplaintResponse() {}

        public static ComplaintResponse fromEntity(Complaint complaint) {
            ComplaintResponse res = new ComplaintResponse();
            res.setId(complaint.getId());
            res.setTicketId(complaint.getTicketId());
            res.setTitle(complaint.getTitle());
            res.setDescription(complaint.getDescription());
            res.setCategory(complaint.getCategory());
            res.setCategoryDisplayName(complaint.getCategory() != null ? complaint.getCategory().getDisplayName() : null);
            res.setLocation(complaint.getLocation());
            res.setPriority(complaint.getPriority());
            res.setStatus(complaint.getStatus());
            res.setStatusDisplayName(complaint.getStatus() != null ? complaint.getStatus().getDisplayName() : null);
            res.setAssignedDepartment(complaint.getAssignedDepartment());
            res.setAdminRemarks(complaint.getAdminRemarks());
            res.setFeedbackRating(complaint.getFeedbackRating());
            res.setFeedbackComment(complaint.getFeedbackComment());
            res.setCreatedAt(complaint.getCreatedAt());
            res.setUpdatedAt(complaint.getUpdatedAt());
            res.setResolvedAt(complaint.getResolvedAt());

            if (complaint.getUser() != null) {
                res.setUserId(complaint.getUser().getId());
                res.setUserName(complaint.getUser().getFullName());
                res.setUserEmail(complaint.getUser().getEmail());
                res.setUserType(complaint.getUser().getUserType());
                res.setUserDepartmentOrHostel(complaint.getUser().getDepartmentOrHostel());
            }
            return res;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTicketId() { return ticketId; }
        public void setTicketId(String ticketId) { this.ticketId = ticketId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Category getCategory() { return category; }
        public void setCategory(Category category) { this.category = category; }

        public String getCategoryDisplayName() { return categoryDisplayName; }
        public void setCategoryDisplayName(String categoryDisplayName) { this.categoryDisplayName = categoryDisplayName; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public Status getStatus() { return status; }
        public void setStatus(Status status) { this.status = status; }

        public String getStatusDisplayName() { return statusDisplayName; }
        public void setStatusDisplayName(String statusDisplayName) { this.statusDisplayName = statusDisplayName; }

        public String getAssignedDepartment() { return assignedDepartment; }
        public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }

        public String getAdminRemarks() { return adminRemarks; }
        public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

        public Integer getFeedbackRating() { return feedbackRating; }
        public void setFeedbackRating(Integer feedbackRating) { this.feedbackRating = feedbackRating; }

        public String getFeedbackComment() { return feedbackComment; }
        public void setFeedbackComment(String feedbackComment) { this.feedbackComment = feedbackComment; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }

        public String getUserDepartmentOrHostel() { return userDepartmentOrHostel; }
        public void setUserDepartmentOrHostel(String userDepartmentOrHostel) { this.userDepartmentOrHostel = userDepartmentOrHostel; }
    }

    // -------------------------------------------------------------------------
    // DASHBOARD & STATS DTO
    // -------------------------------------------------------------------------
    public static class DashboardStatsResponse {
        private long totalComplaints;
        private long pendingComplaints;
        private long inProgressComplaints;
        private long resolvedComplaints;
        private long rejectedComplaints;
        private double resolutionRatePercentage;
        private Map<String, Long> categoryDistribution;
        private List<ComplaintResponse> recentComplaints;

        public DashboardStatsResponse() {}

        public DashboardStatsResponse(long totalComplaints, long pendingComplaints, long inProgressComplaints,
                                      long resolvedComplaints, long rejectedComplaints, double resolutionRatePercentage,
                                      Map<String, Long> categoryDistribution, List<ComplaintResponse> recentComplaints) {
            this.totalComplaints = totalComplaints;
            this.pendingComplaints = pendingComplaints;
            this.inProgressComplaints = inProgressComplaints;
            this.resolvedComplaints = resolvedComplaints;
            this.rejectedComplaints = rejectedComplaints;
            this.resolutionRatePercentage = resolutionRatePercentage;
            this.categoryDistribution = categoryDistribution;
            this.recentComplaints = recentComplaints;
        }

        public long getTotalComplaints() { return totalComplaints; }
        public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

        public long getPendingComplaints() { return pendingComplaints; }
        public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }

        public long getInProgressComplaints() { return inProgressComplaints; }
        public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }

        public long getResolvedComplaints() { return resolvedComplaints; }
        public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }

        public long getRejectedComplaints() { return rejectedComplaints; }
        public void setRejectedComplaints(long rejectedComplaints) { this.rejectedComplaints = rejectedComplaints; }

        public double getResolutionRatePercentage() { return resolutionRatePercentage; }
        public void setResolutionRatePercentage(double resolutionRatePercentage) { this.resolutionRatePercentage = resolutionRatePercentage; }

        public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

        public List<ComplaintResponse> getRecentComplaints() { return recentComplaints; }
        public void setRecentComplaints(List<ComplaintResponse> recentComplaints) { this.recentComplaints = recentComplaints; }
    }

    // -------------------------------------------------------------------------
    // GENERIC API RESPONSE
    // -------------------------------------------------------------------------
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponse() {}

        public ApiResponse(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }

        public static <T> ApiResponse<T> ok(String message) {
            return new ApiResponse<>(true, message, null);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }
}
