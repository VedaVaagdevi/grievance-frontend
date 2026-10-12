package com.campus.grievance.repository;

import com.campus.grievance.model.Category;
import com.campus.grievance.model.Complaint;
import com.campus.grievance.model.Status;
import com.campus.grievance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByTicketId(String ticketId);

    List<Complaint> findByUserOrderByCreatedAtDesc(User user);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(Status status);

    long countByCategory(Category category);

    long countByUser(User user);

    long countByUserAndStatus(User user, Status status);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.ticketId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.user.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.category = :category) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaints(@Param("search") String search,
                                     @Param("status") Status status,
                                     @Param("category") Category category);
}
