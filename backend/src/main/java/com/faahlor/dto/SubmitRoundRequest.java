package com.faahlor.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SubmitRoundRequest {

    @NotNull(message = "matchId is required")
    private UUID matchId;

    @Min(value = 1, message = "Round number must be between 1 and 5")
    @Max(value = 5, message = "Round number must be between 1 and 5")
    private int roundNumber;

    @DecimalMin(value = "0.0", message = "Hue must be between 0 and 360")
    @DecimalMax(value = "360.0", message = "Hue must be between 0 and 360")
    private double hue;

    @DecimalMin(value = "0.0", message = "Brightness must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Brightness must be between 0 and 1")
    private double brightness;
}
