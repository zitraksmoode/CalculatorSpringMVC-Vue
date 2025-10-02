package com.calc.calculator.controller;

import com.calc.calculator.service.CalculatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calc")
public class CalculatorController {

    @Autowired
    private CalculatorService calculatorService;

    @GetMapping("/add/{num1}/{num2}")
    public ResponseEntity<Map<String, Object>> add(@PathVariable BigDecimal num1, @PathVariable BigDecimal num2) {
        BigDecimal result = calculatorService.add(num1, num2);
        String expression = num1 + " + " + num2 + " = " + result;
        calculatorService.saveHistory(expression, result);
        return ResponseEntity.ok(Map.of("result", result, "expression", expression));
    }

    @GetMapping("/subtract/{num1}/{num2}")
    public ResponseEntity<Map<String, Object>> subtract(@PathVariable BigDecimal num1, @PathVariable BigDecimal num2) {
        BigDecimal result = calculatorService.subtract(num1, num2);
        String expression = num1 + " - " + num2 + " = " + result;
        calculatorService.saveHistory(expression, result);
        return ResponseEntity.ok(Map.of("result", result, "expression", expression));
    }

    @GetMapping("/multiply/{num1}/{num2}")
    public ResponseEntity<Map<String, Object>> multiply(@PathVariable BigDecimal num1, @PathVariable BigDecimal num2) {
        BigDecimal result = calculatorService.multiply(num1, num2);
        String expression = num1 + " * " + num2 + " = " + result;
        calculatorService.saveHistory(expression, result);
        return ResponseEntity.ok(Map.of("result", result, "expression", expression));
    }

    @GetMapping("/divide/{num1}/{num2}")
    public ResponseEntity<Map<String, Object>> divide(@PathVariable BigDecimal num1, @PathVariable BigDecimal num2) {
        try {
            BigDecimal result = calculatorService.divide(num1, num2);
            String expression = num1 + " / " + num2 + " = " + result;
            calculatorService.saveHistory(expression, result);
            return ResponseEntity.ok(Map.of("result", result, "expression", expression));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        return ResponseEntity.ok(calculatorService.getHistory());
    }
}