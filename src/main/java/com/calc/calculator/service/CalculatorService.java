package com.calc.calculator.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class CalculatorService {

    private final List<Map<String, Object>> history = new CopyOnWriteArrayList<>();  // Thread-safe in-memory

    public BigDecimal add(BigDecimal num1, BigDecimal num2) {
        return num1.add(num2);
    }

    public BigDecimal subtract(BigDecimal num1, BigDecimal num2) {
        return num1.subtract(num2);
    }

    public BigDecimal multiply(BigDecimal num1, BigDecimal num2) {
        return num1.multiply(num2);
    }

    public BigDecimal divide(BigDecimal num1, BigDecimal num2) {
        if (num2.equals(BigDecimal.ZERO)) {
            throw new IllegalArgumentException("Division by zero!");
        }
        return num1.divide(num2, 10, BigDecimal.ROUND_HALF_UP);
    }

    public void saveHistory(String expression, BigDecimal result) {
        long timestamp = System.currentTimeMillis();
        Map<String, Object> entry = Map.of("expression", expression, "result", result, "timestamp", timestamp);
        history.add(entry);
        // Optim: Parallel Stream для сортировки/обрезки (быстрее на >100 записях)
        if (history.size() > 100) {
            List<Map<String, Object>> recent = history.parallelStream()
                    .sorted((a, b) -> Long.compare((Long) b.get("timestamp"), (Long) a.get("timestamp")))
                    .limit(100)
                    .collect(Collectors.toList());
            history.clear();
            history.addAll(recent);
        }
    }

    public List<Map<String, Object>> getHistory() {
        return new ArrayList<>(history);
    }
}