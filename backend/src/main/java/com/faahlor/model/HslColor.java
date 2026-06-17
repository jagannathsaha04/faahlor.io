package com.faahlor.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * HSL color representation.
 * hue: 0.0 - 360.0
 * saturation: 0.0 - 1.0
 * brightness (lightness): 0.0 - 1.0
 */
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HslColor {
    private double hue;
    private double saturation;
    private double brightness;
}
