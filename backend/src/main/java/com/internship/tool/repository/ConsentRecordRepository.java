package com.internship.tool.repository;

import com.internship.tool.entity.ConsentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, Long> {

    Page<ConsentRecord> findAllByDeletedFalse(Pageable pageable);

    @Query("""
           SELECT c FROM ConsentRecord c
           WHERE c.deleted = false
             AND (LOWER(c.subjectId) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(c.purpose)   LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(COALESCE(c.subjectEmail, '')) LIKE LOWER(CONCAT('%', :q, '%')))
           """)
    Page<ConsentRecord> search(@Param("q") String q, Pageable pageable);

    long countByDeletedFalseAndStatus(String status);

    long countByDeletedFalse();

    @Query("SELECT c FROM ConsentRecord c WHERE c.deleted=false AND c.expiresAt BETWEEN :from AND :to")
    List<ConsentRecord> findExpiringBetween(@Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);
}
