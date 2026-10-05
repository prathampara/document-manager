package com.example.docmanager;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(Long id) {
        super("Document " + id + " not found");
    }
}
