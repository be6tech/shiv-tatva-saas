package com.shivtatva.hrms.controllers;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
  @GetMapping("/health")
  public Map<String, Object> health() {
    return Map.of("ok", true, "service", "hrms-service", "ts", Instant.now().toString());
  }
}

