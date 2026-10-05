package com.example.docmanager;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {
    @Mock DocumentRepository repository;
    @InjectMocks DocumentService service;

    @Test
    void uploadStoresFileAndReturnsMetadata() throws Exception {
        when(repository.save(any(Document.class))).thenAnswer(i -> i.getArgument(0));
        var file = new MockMultipartFile("file", "notes.txt", "text/plain", "hello".getBytes());

        DocumentDto dto = service.upload(file);

        assertEquals("notes.txt", dto.name());
        assertEquals("text/plain", dto.contentType());
        assertEquals(5, dto.size());
    }

    @Test
    void uploadRejectsEmptyFile() {
        var empty = new MockMultipartFile("file", "a.txt", "text/plain", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> service.upload(empty));
        verifyNoInteractions(repository);
    }

    @Test
    void getThrowsWhenMissing() {
        when(repository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(DocumentNotFoundException.class, () -> service.get(9L));
    }

    @Test
    void listDelegatesToRepository() {
        when(repository.findAllSummaries()).thenReturn(List.of());
        assertTrue(service.list().isEmpty());
    }

    @Test
    void deleteRemovesExistingDocument() {
        when(repository.existsById(1L)).thenReturn(true);
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void deleteThrowsWhenMissing() {
        when(repository.existsById(2L)).thenReturn(false);
        assertThrows(DocumentNotFoundException.class, () -> service.delete(2L));
        verify(repository, never()).deleteById(any());
    }
}
