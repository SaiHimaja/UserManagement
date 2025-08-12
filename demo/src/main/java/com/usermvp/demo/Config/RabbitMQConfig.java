package com.usermvp.demo.Config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String IMAGE_CLEANUP_QUEUE = "image_cleanup_queue";


    @Bean

    public Queue imageCleanupQueue() {
        return new Queue(IMAGE_CLEANUP_QUEUE, true);
    }
    
}
