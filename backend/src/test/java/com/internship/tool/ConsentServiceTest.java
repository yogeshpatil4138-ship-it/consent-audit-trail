package com.internship.tool;

import com.internship.tool.dto.ConsentDtos;
import com.internship.tool.entity.ConsentRecord;
import com.internship.tool.exception.NotFoundException;
import com.internship.tool.repository.ConsentRecordRepository;
import com.internship.tool.service.AiServiceClient;
import com.internship.tool.service.AuditService;
import com.internship.tool.service.ConsentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsentServiceTest {

    @Mock ConsentRecordRepository repo;
    @Mock AiServiceClient ai;
    @Mock AuditService audit;

    @InjectMocks ConsentService svc;

    ConsentRecord sample;

    @BeforeEach
    void setUp() {
        sample = ConsentRecord.builder()
                .id(1L).subjectId("S-1").purpose("Marketing")
                .legalBasis("Consent").consentGiven(true)
                .status("ACTIVE").deleted(false).build();
    }

    @Test void get_returnsRecord() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        assertThat(svc.get(1L).getSubjectId()).isEqualTo("S-1");
    }

    @Test void get_notFound() {
        when(repo.findById(2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> svc.get(2L)).isInstanceOf(NotFoundException.class);
    }

    @Test void get_softDeletedThrows() {
        sample.setDeleted(true);
        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        assertThatThrownBy(() -> svc.get(1L)).isInstanceOf(NotFoundException.class);
    }

    @Test void create_persistsAndReturns() {
        var req = ConsentDtos.CreateRequest.builder()
                .subjectId("S-9").purpose("Newsletter")
                .legalBasis("Consent").consentGiven(true).build();
        when(repo.save(any())).thenAnswer(inv -> { var c = (ConsentRecord) inv.getArgument(0); c.setId(9L); return c; });
        var res = svc.create(req);
        assertThat(res.getId()).isEqualTo(9L);
        assertThat(res.getStatus()).isEqualTo("ACTIVE");
        verify(audit).log(eq("ConsentRecord"), eq("9"), eq("CREATE"), any());
    }

    @Test void create_pendingWhenNoConsent() {
        var req = ConsentDtos.CreateRequest.builder()
                .subjectId("S-9").purpose("Newsletter")
                .legalBasis("Consent").consentGiven(false).build();
        when(repo.save(any())).thenAnswer(inv -> { var c = (ConsentRecord) inv.getArgument(0); c.setId(9L); return c; });
        assertThat(svc.create(req).getStatus()).isEqualTo("PENDING");
    }

    @Test void update_setsWithdrawnWhenDateProvided() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        var req = new ConsentDtos.UpdateRequest();
        req.setWithdrawnAt(LocalDateTime.now());
        assertThat(svc.update(1L, req).getStatus()).isEqualTo("WITHDRAWN");
    }

    @Test void softDelete_flagsRecord() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        svc.softDelete(1L);
        assertThat(sample.isDeleted()).isTrue();
        verify(audit).log(eq("ConsentRecord"), eq("1"), eq("DELETE"), any());
    }

    @Test void stats_aggregatesCounts() {
        when(repo.countByDeletedFalse()).thenReturn(10L);
        when(repo.countByDeletedFalseAndStatus("ACTIVE")).thenReturn(6L);
        when(repo.countByDeletedFalseAndStatus("EXPIRED")).thenReturn(2L);
        when(repo.countByDeletedFalseAndStatus("WITHDRAWN")).thenReturn(2L);
        var s = svc.stats();
        assertThat(s.getTotal()).isEqualTo(10);
        assertThat(s.getActive() + s.getExpired() + s.getWithdrawn()).isEqualTo(10);
    }

    @Test void aiReport_fallsBackWhenAiNull() {
        when(repo.countByDeletedFalse()).thenReturn(0L);
        when(ai.generateReport(any())).thenReturn(null);
        var r = svc.aiReport();
        assertThat(r.get("is_fallback")).isEqualTo(true);
    }

    @Test void list_delegatesToRepo() {
        Pageable p = PageRequest.of(0, 20);
        when(repo.findAllByDeletedFalse(p)).thenReturn(new PageImpl<>(List.of(sample), p, 1));
        assertThat(svc.list(p).getTotalElements()).isEqualTo(1);
    }

    @Test void search_blankFallsBackToList() {
        Pageable p = PageRequest.of(0, 20);
        when(repo.findAllByDeletedFalse(p)).thenReturn(new PageImpl<>(List.of(), p, 0));
        assertThat(svc.search("  ", p).getTotalElements()).isZero();
    }
}
