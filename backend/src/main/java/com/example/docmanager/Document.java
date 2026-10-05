package com.example.docmanager;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private long size;

    @Column(nullable = false)
    private Instant uploadedAt = Instant.now();

    @Column(nullable = false)
    private byte[] data;

    protected Document() {}

    public Document(String name, String contentType, byte[] data) {
        this.name = name;
        this.contentType = contentType;
        this.size = data.length;
        this.data = data;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
    public Instant getUploadedAt() { return uploadedAt; }
    public byte[] getData() { return data; }
}
