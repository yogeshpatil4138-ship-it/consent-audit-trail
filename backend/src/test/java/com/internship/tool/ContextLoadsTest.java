package com.internship.tool;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

// Mail auto-config must stay enabled: NotificationService injects JavaMailSender,
// which is only created by MailSenderAutoConfiguration.
//
// Redis auto-config is excluded, so the cache MUST be 'none' (a no-op CacheManager).
// With cache.type=redis and no RedisConnectionFactory, no CacheManager is created and
// the entityManagerFactory fails with "depends on missing bean 'cacheManager'".
// These properties are pinned here (they beat any application.yml) so the smoke test
// never depends on which application.yml ends up on the test classpath.
@SpringBootTest(properties = {
        "spring.cache.type=none",
        "spring.flyway.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:ctxtest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.mail.host=localhost",
        "app.seed.enabled=false"
})
@EnableAutoConfiguration(exclude = {
        RedisAutoConfiguration.class,
        RedisRepositoriesAutoConfiguration.class
})
class ContextLoadsTest {
    @Test void contextLoads() { /* smoke test */ }
}