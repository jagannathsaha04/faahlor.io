package com.faahlor.service;

import com.faahlor.model.HslColor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ColorGenerationServiceTest {

    private ColorGenerationService colorGenerationService;

    @BeforeEach
    void setUp() {
        colorGenerationService = new ColorGenerationService();
    }

    @RepeatedTest(50)
    void generatedColor_hueInValidRange() {
        HslColor color = colorGenerationService.generateTargetColor();
        assertThat(color.getHue()).isBetween(0.0, 360.0);
    }

    @RepeatedTest(50)
    void generatedColor_saturationAlways1() {
        HslColor color = colorGenerationService.generateTargetColor();
        assertThat(color.getSaturation()).isEqualTo(1.0);
    }

    @RepeatedTest(50)
    void generatedColor_brightnessInValidRange() {
        HslColor color = colorGenerationService.generateTargetColor();
        assertThat(color.getBrightness()).isBetween(0.25, 0.75);
    }

    @Test
    void generatedColors_areNotAllIdentical() {
        HslColor first = colorGenerationService.generateTargetColor();
        boolean foundDifferent = false;
        for (int i = 0; i < 20; i++) {
            HslColor next = colorGenerationService.generateTargetColor();
            if (next.getHue() != first.getHue() || next.getBrightness() != first.getBrightness()) {
                foundDifferent = true;
                break;
            }
        }
        assertThat(foundDifferent).as("Colors should not all be identical").isTrue();
    }
}
