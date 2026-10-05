package com.example.docmanager;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Query("""
        select new com.example.docmanager.DocumentDto(d.id, d.name, d.contentType, d.size, d.uploadedAt)
        from Document d order by d.uploadedAt desc
        """)
    List<DocumentDto> findAllSummaries();
}
