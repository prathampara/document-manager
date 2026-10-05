package com.example.docmanager;

import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {
    private final DocumentRepository repository;

    public DocumentService(DocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public DocumentDto upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose a non-empty file to upload.");
        }
        String name = file.getOriginalFilename() == null ? "untitled" : file.getOriginalFilename();
        String type = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        return DocumentDto.from(repository.save(new Document(name, type, file.getBytes())));
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> list() {
        return repository.findAllSummaries();
    }

    @Transactional(readOnly = true)
    public Document get(Long id) {
        return repository.findById(id).orElseThrow(() -> new DocumentNotFoundException(id));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new DocumentNotFoundException(id);
        repository.deleteById(id);
    }
}
