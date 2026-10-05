package com.example.docmanager;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DocumentController.class)
class DocumentControllerTest {
    @Autowired MockMvc mvc;
    @MockBean DocumentService service;

    @Test
    void listReturnsDocuments() throws Exception {
        when(service.list()).thenReturn(List.of(new DocumentDto(1L, "a.pdf", "application/pdf", 10, Instant.now())));
        mvc.perform(get("/api/documents"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].name").value("a.pdf"));
    }

    @Test
    void uploadReturns201() throws Exception {
        when(service.upload(any())).thenReturn(new DocumentDto(2L, "b.txt", "text/plain", 3, Instant.now()));
        var file = new MockMultipartFile("file", "b.txt", "text/plain", "abc".getBytes());
        mvc.perform(multipart("/api/documents").file(file))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    void contentReturns404WhenMissing() throws Exception {
        when(service.get(7L)).thenThrow(new DocumentNotFoundException(7L));
        mvc.perform(get("/api/documents/7/content"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void contentIsServedInline() throws Exception {
        var doc = new Document("n.txt", "text/plain", "hi".getBytes());
        when(service.get(3L)).thenReturn(doc);
        mvc.perform(get("/api/documents/3/content"))
           .andExpect(status().isOk())
           .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("inline")))
           .andExpect(content().string("hi"));
    }

    @Test
    void deleteReturns204() throws Exception {
        mvc.perform(delete("/api/documents/1")).andExpect(status().isNoContent());
    }
}
