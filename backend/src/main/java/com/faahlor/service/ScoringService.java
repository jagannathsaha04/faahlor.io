package com.faahlor.service;

import com.faahlor.model.HslColor;
import org.springframework.stereotype.Service;

/**
 * Scoring approach: Weighted HSL distance
 *
 * We compute the perceptual distance between two HSL colors using a weighted
 * combination of hue and brightness differences.
 *
 * Hue is circular (0–360), so we use the shortest angular distance.
 * Max hue difference = 180°.
 *
 * Brightness (lightness) range is 0.25–0.75 (range = 0.50).
 *
 * Weights:
 *   - Hue contributes 70% of the score (most perceptually salient)
 *   - Brightness contributes 30%
 *
 * Normalized distance = 0.70 * (hueDiff / 180) + 0.30 * (brightnessDiff / 0.50)
 * This value is in [0, 1].
 *
 * Accuracy = (1 - normalizedDistance) * 100  → percentage
 *
 * Score = round(accuracy) mapped to 0–1000 scale:
 *   score = round(accuracy * 10)
 *
 * Examples:
 *   - Exact match → 100% accuracy → 1000 points
 *   - 90% accuracy → 900 points
 *   - 50% accuracy → 500 points
 */
@Service
public class ScoringService {

    private static final double HUE_WEIGHT = 0.70;
    private static final double BRIGHTNESS_WEIGHT = 0.30;
    private static final double MAX_HUE_DIFF = 180.0;
    private static final double MAX_BRIGHTNESS_DIFF = 0.50;
    private static final int MAX_SCORE_PER_ROUND = 1000;

    /**
     * Calculates the accuracy percentage (0.0–100.0) between target and submitted.
     */
    public double calculateAccuracy(HslColor target, HslColor submitted) {
        double hueDiff = circularHueDiff(target.getHue(), submitted.getHue());
        double brightnessDiff = Math.abs(target.getBrightness() - submitted.getBrightness());

        double normalizedHue = Math.min(hueDiff / MAX_HUE_DIFF, 1.0);
        double normalizedBrightness = Math.min(brightnessDiff / MAX_BRIGHTNESS_DIFF, 1.0);

        double normalizedDistance = HUE_WEIGHT * normalizedHue + BRIGHTNESS_WEIGHT * normalizedBrightness;

        double accuracy = (1.0 - normalizedDistance) * 100.0;
        return Math.max(0.0, Math.min(100.0, accuracy));
    }

    /**
     * Converts accuracy percentage to a round score (0–1000).
     */
    public int calculateScore(double accuracy) {
        return (int) Math.round(accuracy * MAX_SCORE_PER_ROUND / 100.0);
    }

    private double circularHueDiff(double h1, double h2) {
        double diff = Math.abs(h1 - h2);
        return Math.min(diff, 360.0 - diff);
    }
}
