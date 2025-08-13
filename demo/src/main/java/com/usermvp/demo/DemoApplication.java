package com.usermvp.demo;





import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableJpaAuditing
public class DemoApplication {

	private static final Logger logger = LogManager.getLogger(DemoApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	 @PostConstruct
    public void testLog() {
        logger.info("Testing Logstash connection on startup");
    }
}
