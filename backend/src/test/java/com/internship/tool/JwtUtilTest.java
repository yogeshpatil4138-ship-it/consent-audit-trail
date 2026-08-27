package com.internship.tool;

import com.internship.tool.security.JwtUtil;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private static final String SECRET = "test-secret-please-ignore-this-is-only-for-unit-tests-32chars";

    @Test void generatesAndParses() {
        JwtUtil util = new JwtUtil(SECRET, 60_000);
        String token = util.generate("alice", "ADMIN");
        assertThat(util.extractUsername(token)).isEqualTo("alice");
        assertThat(util.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtUtil("short", 60_000))
                .isInstanceOf(IllegalStateException.class);
    }
}
