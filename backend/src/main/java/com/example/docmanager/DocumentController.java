package com.example.docmanager;

import java.io.IOException;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentDto upload(@RequestParam("file") MultipartFile file) throws IOException {
        return service.upload(file);
    }

    @GetMapping
    public List<DocumentDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public DocumentDto metadata(@PathVariable Long id) {
        return DocumentDto.from(service.get(id));
    }

    /** Inline by default (for viewing); pass ?download=true to force a download. */
    @GetMapping("/{id}/content")
    public ResponseEntity<byte[]> content(@PathVariable Long id,
                                          @RequestParam(defaultValue = "false") boolean download) {
        Document doc = service.get(id);
        ContentDisposition disposition = (download ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(doc.getName(), java.nio.charset.StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(doc.getData());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
