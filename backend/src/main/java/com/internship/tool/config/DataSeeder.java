package com.internship.tool.config;

import com.internship.tool.entity.AppUser;
import com.internship.tool.entity.ConsentRecord;
import com.internship.tool.repository.AppUserRepository;
import com.internship.tool.repository.ConsentRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ConsentRecordRepository consents;
    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public DataSeeder(ConsentRecordRepository consents, AppUserRepository users,
                      PasswordEncoder encoder, @Value("${app.seed.enabled}") boolean enabled) {
        this.consents = consents; this.users = users;
        this.encoder = encoder;   this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled) { log.info("Seeder disabled."); return; }

        if (users.count() == 0) {
            users.save(AppUser.builder().username("admin").email("admin@example.com")
                    .passwordHash(encoder.encode("admin123")).role("ADMIN").enabled(true).build());
            users.save(AppUser.builder().username("auditor").email("auditor@example.com")
                    .passwordHash(encoder.encode("audit123")).role("USER").enabled(true).build());
            log.info("Seeded default users: admin/admin123 and auditor/audit123");
        }

        if (consents.count() > 0) { log.info("Consent records already present ({}). Skipping.", consents.count()); return; }

        List<String> purposes = List.of(
                "Marketing email newsletter", "Analytics cookies", "Customer service call recording",
                "Product usage telemetry", "Job application review", "Loyalty program enrollment",
                "Third-party ad personalization", "Location tracking for delivery",
                "Health data processing for wellness app", "Biometric login (fingerprint)"
        );
        List<String> bases = List.of("Consent", "Contract", "Legal Obligation", "Legitimate Interest");
        List<String> sources = List.of("web-signup", "mobile-app", "in-store-kiosk", "call-center", "email");
        List<String> statuses = List.of("ACTIVE","ACTIVE","ACTIVE","EXPIRED","WITHDRAWN","PENDING");
        Random r = new Random(42);

        for (int i = 1; i <= 30; i++) {
            String status = statuses.get(r.nextInt(statuses.size()));
            boolean given = !status.equals("PENDING") && !status.equals("WITHDRAWN") || r.nextBoolean();
            LocalDateTime granted = status.equals("PENDING") ? null : LocalDateTime.now().minusDays(r.nextInt(400));
            LocalDateTime expires = granted == null ? null : granted.plusDays(365);
            LocalDateTime withdrawn = status.equals("WITHDRAWN") ? LocalDateTime.now().minusDays(r.nextInt(60)) : null;
            if (status.equals("EXPIRED")) expires = LocalDateTime.now().minusDays(r.nextInt(30) + 1);

            consents.save(ConsentRecord.builder()
                    .subjectId(String.format("SUB-%05d", 10000 + i))
                    .subjectEmail("subject" + i + "@example.com")
                    .purpose(purposes.get(r.nextInt(purposes.size())))
                    .legalBasis(bases.get(r.nextInt(bases.size())))
                    .consentGiven(given)
                    .grantedAt(granted)
                    .expiresAt(expires)
                    .withdrawnAt(withdrawn)
                    .status(status)
                    .source(sources.get(r.nextInt(sources.size())))
                    .evidenceUrl("https://evidence.example.com/" + i + ".pdf")
                    .dataCategories("email,name" + (r.nextBoolean() ? ",location" : ""))
                    .deleted(false)
                    .build());
        }
        log.info("Seeded 30 demo consent records.");
    }
}
