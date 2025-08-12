package com.usermvp.demo.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.usermvp.demo.Config.RabbitMQConfig;


@Service
public class ImageCleanupProducer {

    private final RabbitTemplate rabbitTemplate;

    public ImageCleanupProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendCleanupMessage() {
        rabbitTemplate.convertAndSend(RabbitMQConfig.IMAGE_CLEANUP_QUEUE, "start-cleanup");
    }
}
