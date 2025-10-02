package com.calc.calculator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CalculatorSpringMvcApplication {
    public static void main(String[] args) {
        SpringApplication.run(CalculatorSpringMvcApplication.class, args);
    }
}