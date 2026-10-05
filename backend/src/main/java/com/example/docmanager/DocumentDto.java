package com.example.docmanager;

import java.time.Instant;

/** Metadata only, so listing never loads file bytes. */
public record DocumentDto(Long id, String name, String contentType, long size, Instant uploadedAt) {
    public static DocumentDto from(Document d) {
        return new DocumentDto(d.getId(), d.getName(), d.getContentType(), d.getSize(), d.getUploadedAt());
    }
}
