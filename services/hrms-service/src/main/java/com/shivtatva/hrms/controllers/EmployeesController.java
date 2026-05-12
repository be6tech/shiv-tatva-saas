package com.shivtatva.hrms.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeesController {
  @GetMapping("/employees")
  public Map<String, Object> employees() {
    var employees =
        List.of(
            Map.of(
                "id", "ST-EMP-001",
                "name", "Demo Employee",
                "department", "Engineering",
                "designation", "Frontend Developer",
                "status", "Active"));
    return Map.of("employees", employees);
  }
}

