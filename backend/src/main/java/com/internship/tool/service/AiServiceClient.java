package com.internship.tool.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate rest;
    private final String baseUrl;

    public AiServiceClient(RestTemplate rest, @Value("${app.ai.base-url}") String baseUrl) {
        this.rest = rest;
        this.baseUrl = baseUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String,Object> describe(String subject, String purpose, String legalBasis) {
        return post("/describe", Map.of(
                "subject", subject == null ? "" : subject,
                "purpose", purpose == null ? "" : purpose,
                "legal_basis", legalBasis == null ? "" : legalBasis
        ));
    }

    @SuppressWarnings("unchecked")
    public Map<String,Object> recommend(String subject, String purpose, String status) {
        return post("/recommend", Map.of(
                "subject", subject == null ? "" : subject,
                "purpose", purpose == null ? "" : purpose,
                "status",  status  == null ? "" : status
        ));
    }

    @SuppressWarnings("unchecked")
    public Map<String,Object> generateReport(Map<String,Object> stats) {
        return post("/generate-report", Map.of("stats", stats));
    }

    private Map<String,Object> post(String path, Map<String,Object> body) {
        try {
            HttpHeaders h = new HttpHeaders();
            h.setContentType(MediaType.APPLICATION_JSON);
            @SuppressWarnings("rawtypes")
            Map response = rest.postForObject(baseUrl + path, new HttpEntity<>(body, h), Map.class);
            return response;
        } catch (Exception e) {
            log.warn("AI call to {} failed: {}", path, e.getMessage());
            return null;
        }
    }
}
