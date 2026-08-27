package com.internship.tool.controller;

import com.internship.tool.service.AiServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Proxy to Flask AI microservice")
public class AiController {

    private final AiServiceClient ai;
    public AiController(AiServiceClient ai) { this.ai = ai; }

    @PostMapping("/describe")
    @Operation(summary = "Describe a consent record via AI")
    public Map<String,Object> describe(@RequestBody Map<String,Object> body) {
        var res = ai.describe(str(body, "subject"), str(body, "purpose"), str(body, "legal_basis"));
        return res != null ? res : Map.of("is_fallback", true,
                "description", "AI service unavailable.",
                "compliance_score", 0);
    }

    @PostMapping("/recommend")
    @Operation(summary = "Recommend actions for a consent record via AI")
    public Map<String,Object> recommend(@RequestBody Map<String,Object> body) {
        var res = ai.recommend(str(body, "subject"), str(body, "purpose"), str(body, "status"));
        return res != null ? res : Map.of("is_fallback", true, "recommendations", java.util.List.of());
    }

    private static String str(Map<String,Object> m, String k) {
        Object v = m == null ? null : m.get(k);
        return v == null ? "" : v.toString();
    }
}
