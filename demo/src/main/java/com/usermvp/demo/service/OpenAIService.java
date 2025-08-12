package com.usermvp.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OpenAIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final AtomicLong lastRequestTime = new AtomicLong(0);
    private final long MIN_REQUEST_INTERVAL = 2000;

    public OpenAIService(@Value("${openai.api.key}") String openAiApiKey) {
        this.webClient = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader("Authorization", "Bearer " + openAiApiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
        this.objectMapper = new ObjectMapper();
        System.out.println("OpenAI Service initialized successfully");
    }

    public Flux<String> streamChatCompletion(String prompt) {
        return checkRateLimit()
            .then(Mono.defer(() -> makeOpenAIRequest(prompt)))
            .flatMapMany(flux -> flux)
            .onErrorResume(this::handleError);
    }

    private Mono<Void> checkRateLimit() {
        long currentTime = System.currentTimeMillis();
        long lastTime = lastRequestTime.get();
        long timeDiff = currentTime - lastTime;

        if (timeDiff < MIN_REQUEST_INTERVAL) {
            long waitTime = MIN_REQUEST_INTERVAL - timeDiff;
            return Mono.delay(Duration.ofMillis(waitTime)).then();
        }

        lastRequestTime.set(currentTime);
        return Mono.empty();
    }

    private Mono<Flux<String>> makeOpenAIRequest(String prompt) {
        System.out.println("Making OpenAI request for: " + prompt);
        
        Map<String, Object> requestBody = Map.of(
            "model", "gpt-3.5-turbo",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "stream", true,
            "max_tokens", 500,
            "temperature", 0.7
        );

        return Mono.just(
            webClient.post()
                .uri("/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractContentFromChunk)
                .filter(text -> !text.isEmpty())
        );
    }

    private String extractContentFromChunk(String chunk) {
        try {
            // Handle the [DONE] signal
            if (chunk.trim().equals("[DONE]")) {
                return "";
            }

            // Parse JSON directly
            JsonNode rootNode = objectMapper.readTree(chunk);
            JsonNode choices = rootNode.get("choices");
            
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode delta = choices.get(0).get("delta");
                if (delta != null && delta.has("content")) {
                    String content = delta.get("content").asText();
                    return content; // Return content as-is, let frontend handle spacing
                }
                
                // Check for finish_reason
                JsonNode finishReason = choices.get(0).get("finish_reason");
                if (finishReason != null && !"null".equals(finishReason.asText())) {
                    return "";
                }
            }
            
        } catch (Exception e) {
            // Try SSE format as fallback
            try {
                return extractFromSSEFormat(chunk);
            } catch (Exception e2) {
                // Ignore parsing errors for non-content chunks
            }
        }
        return "";
    }

    private String extractFromSSEFormat(String raw) throws Exception {
        String trimmed = raw.trim();
        
        if (trimmed.isEmpty() || trimmed.equals("data: [DONE]")) {
            return "";
        }
        
        if (!trimmed.startsWith("data: ")) {
            return "";
        }

        String jsonStr = trimmed.substring(6).trim();
        if (jsonStr.isEmpty()) {
            return "";
        }

        JsonNode rootNode = objectMapper.readTree(jsonStr);
        JsonNode choices = rootNode.get("choices");
        
        if (choices != null && choices.isArray() && choices.size() > 0) {
            JsonNode delta = choices.get(0).get("delta");
            if (delta != null && delta.has("content")) {
                return delta.get("content").asText();
            }
        }
        
        return "";
    }

    private Flux<String> handleError(Throwable error) {
        System.err.println("OpenAI API Error: " + error.getMessage());
        
        if (error instanceof WebClientResponseException) {
            WebClientResponseException webError = (WebClientResponseException) error;
            switch (webError.getStatusCode().value()) {
                case 429:
                    return Flux.just("⚠️ Rate limit exceeded. Please wait a moment and try again.");
                case 401:
                    return Flux.just("❌ Invalid API key. Please check your OpenAI configuration.");
                case 400:
                    return Flux.just("❌ Invalid request. Please try a different prompt.");
                case 500:
                    return Flux.just("❌ OpenAI service error. Please try again later.");
                default:
                    return Flux.just("❌ Service temporarily unavailable. Error: " + webError.getStatusCode());
            }
        }
        
        return Flux.just("❌ Connection error. Please check your internet connection and try again.");
    }
}