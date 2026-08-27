package com.internship.tool.controller;

import com.internship.tool.dto.ConsentDtos;
import com.internship.tool.service.ConsentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@RestController
@RequestMapping("/api/consents")
@Tag(name = "Consents", description = "Consent audit records")
public class ConsentController {

    private final ConsentService svc;
    public ConsentController(ConsentService svc) { this.svc = svc; }

    @GetMapping
    @Operation(summary = "List consents (paginated)")
    public Page<ConsentDtos.Response> list(Pageable p) { return svc.list(p); }

    @GetMapping("/search")
    @Operation(summary = "Search consents by subject/purpose/email")
    public Page<ConsentDtos.Response> search(@RequestParam(name = "q", required = false) String q, Pageable p) {
        return svc.search(q, p);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one consent")
    public ConsentDtos.Response get(@PathVariable Long id) { return svc.get(id); }

    @PostMapping
    @Operation(summary = "Create consent")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsentDtos.Response create(@Valid @RequestBody ConsentDtos.CreateRequest r) {
        return svc.create(r);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update consent")
    public ConsentDtos.Response update(@PathVariable Long id,
                                       @Valid @RequestBody ConsentDtos.UpdateRequest r) {
        return svc.update(id, r);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete consent (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "KPI stats for dashboard")
    public ConsentDtos.Stats stats() { return svc.stats(); }

    @GetMapping("/report")
    @Operation(summary = "AI-generated audit report")
    public Map<String,Object> report() { return svc.aiReport(); }

    @GetMapping("/export")
    @Operation(summary = "Export CSV")
    public void export(HttpServletResponse res) throws IOException {
        res.setContentType("text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=\"consents.csv\"");
        PrintWriter w = res.getWriter();
        w.println("id,subject_id,purpose,legal_basis,status,granted_at,expires_at");
        int page = 0;
        Page<ConsentDtos.Response> p;
        do {
            p = svc.list(org.springframework.data.domain.PageRequest.of(page++, 100));
            for (var c : p.getContent()) {
                w.printf("%d,%s,%s,%s,%s,%s,%s%n",
                        c.getId(), esc(c.getSubjectId()), esc(c.getPurpose()),
                        esc(c.getLegalBasis()), esc(c.getStatus()),
                        c.getGrantedAt(), c.getExpiresAt());
            }
        } while (p.hasNext());
    }

    private String esc(String s) {
        if (s == null) return "";
        boolean needsQuote = s.contains(",") || s.contains("\"") || s.contains("\n");
        String v = s.replace("\"", "\"\"");
        return needsQuote ? "\"" + v + "\"" : v;
    }
}
