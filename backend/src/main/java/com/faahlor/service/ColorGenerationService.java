package com.faahlor.service;

import com.faahlor.model.HslColor;
import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * Generates random target colors server-side.
 *
 * Spec rules:
 *   Hue:        0 <= h < 360  (full spectrum)
 *   Saturation: 1.0           (fixed, never user-controlled)
 *   Brightness: 0.25 <= b <= 0.75  (avoids near-black and near-white)
 */
@Service
public class ColorGenerationService {

    private static final double SATURATION = 1.0;
    private static final double MIN_BRIGHTNESS = 0.25;
    private static final double MAX_BRIGHTNESS = 0.75;

    private final Random random = new Random();

    public HslColor generateTargetColor() {
        double hue = random.nextDouble() * 360.0;
        double brightness = MIN_BRIGHTNESS + random.nextDouble() * (MAX_BRIGHTNESS - MIN_BRIGHTNESS);
        // Round to 1 decimal for hue, 3 decimals for brightness
        return new HslColor(
                Math.round(hue * 10.0) / 10.0,
                SATURATION,
                Math.round(brightness * 1000.0) / 1000.0
        );
    }
}
