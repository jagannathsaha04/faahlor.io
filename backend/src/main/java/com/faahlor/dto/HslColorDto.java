package com.faahlor.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HslColorDto {

    @DecimalMin("0.0")
    @DecimalMax("360.0")
    private double hue;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private double saturation;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private double brightness;
}
