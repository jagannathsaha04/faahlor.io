package com.faahlor.service;

import com.faahlor.model.HslColor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ScoringServiceTest {

    private ScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
    }

    @Test
    void perfectMatch_returns100AccuracyAnd1000Score() {
        HslColor color = new HslColor(120.0, 1.0, 0.5);
        double accuracy = scoringService.calculateAccuracy(color, color);
        int score = scoringService.calculateScore(accuracy);

        assertThat(accuracy).isEqualTo(100.0, within(0.001));
        assertThat(score).isEqualTo(1000);
    }

    @Test
    void maxHueDifference_zeroesOutHueComponent() {
        // hue diff = 180, brightness same → normalized = 0.70 * 1.0 + 0.30 * 0.0 = 0.70
        // accuracy = (1 - 0.70) * 100 = 30
        HslColor target = new HslColor(0.0, 1.0, 0.5);
        HslColor submitted = new HslColor(180.0, 1.0, 0.5);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        assertThat(accuracy).isEqualTo(30.0, within(0.001));
        assertThat(scoringService.calculateScore(accuracy)).isEqualTo(300);
    }

    @Test
    void maxBrightnessDifference_zeroesOutBrightnessComponent() {
        // brightness diff = 0.50, hue same → normalized = 0.70 * 0 + 0.30 * 1.0 = 0.30
        // accuracy = (1 - 0.30) * 100 = 70
        HslColor target = new HslColor(120.0, 1.0, 0.25);
        HslColor submitted = new HslColor(120.0, 1.0, 0.75);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        assertThat(accuracy).isEqualTo(70.0, within(0.001));
        assertThat(scoringService.calculateScore(accuracy)).isEqualTo(700);
    }

    @Test
    void worstCase_hueDiff180AndBrightnessDiff50_returnsZero() {
        // normalized = 0.70 * 1.0 + 0.30 * 1.0 = 1.0
        // accuracy = max(0, (1 - 1.0) * 100) = 0
        HslColor target = new HslColor(0.0, 1.0, 0.25);
        HslColor submitted = new HslColor(180.0, 1.0, 0.75);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        assertThat(accuracy).isEqualTo(0.0, within(0.001));
        assertThat(scoringService.calculateScore(accuracy)).isEqualTo(0);
    }

    @Test
    void hueIsCircular_359and1_differByOnly2Degrees() {
        HslColor target = new HslColor(359.0, 1.0, 0.5);
        HslColor submitted = new HslColor(1.0, 1.0, 0.5);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        // hueDiff = min(358, 2) = 2
        // normalized = 0.70 * (2/180) = 0.70 * 0.01111 = 0.00778
        // accuracy = (1 - 0.00778) * 100 = 99.22
        assertThat(accuracy).isGreaterThan(99.0);
    }

    @Test
    void hueWrapAround_0and360_areSameColor() {
        HslColor target = new HslColor(0.0, 1.0, 0.5);
        HslColor submitted = new HslColor(360.0, 1.0, 0.5);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        // hueDiff = min(360, 0) = 0
        assertThat(accuracy).isEqualTo(100.0, within(0.001));
    }

    @Test
    void accuracyNeverExceeds100() {
        HslColor color = new HslColor(90.0, 1.0, 0.4);
        double accuracy = scoringService.calculateAccuracy(color, color);
        assertThat(accuracy).isLessThanOrEqualTo(100.0);
    }

    @Test
    void accuracyNeverBelowZero() {
        // Even extreme differences should floor at 0
        HslColor target = new HslColor(0.0, 1.0, 0.0);
        HslColor submitted = new HslColor(180.0, 1.0, 1.0);

        double accuracy = scoringService.calculateAccuracy(target, submitted);
        assertThat(accuracy).isGreaterThanOrEqualTo(0.0);
    }

    @ParameterizedTest(name = "hue {0} vs {1} → accuracy >= {2}")
    @CsvSource({
            "0.0,   10.0,  0.5, 0.5, 90.0",
            "180.0, 180.0, 0.5, 0.5, 100.0",
            "90.0,  270.0, 0.5, 0.5, 30.0",
    })
    void parameterizedScoringCases(double h1, double h2, double b1, double b2, double expectedMinAccuracy) {
        HslColor target = new HslColor(h1, 1.0, b1);
        HslColor submitted = new HslColor(h2, 1.0, b2);
        double accuracy = scoringService.calculateAccuracy(target, submitted);
        assertThat(accuracy).isGreaterThanOrEqualTo(expectedMinAccuracy - 0.01);
    }

    @Test
    void scoreRoundsCorrectly() {
        // accuracy 92.5 → score = round(92.5 * 10) = 925
        assertThat(scoringService.calculateScore(92.5)).isEqualTo(925);
        // accuracy 92.4 → score = round(92.4 * 10) = 924
        assertThat(scoringService.calculateScore(92.4)).isEqualTo(924);
        // accuracy 0.0 → score = 0
        assertThat(scoringService.calculateScore(0.0)).isEqualTo(0);
        // accuracy 100.0 → score = 1000
        assertThat(scoringService.calculateScore(100.0)).isEqualTo(1000);
    }
}
