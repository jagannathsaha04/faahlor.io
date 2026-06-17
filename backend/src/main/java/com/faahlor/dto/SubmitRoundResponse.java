package com.faahlor.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubmitRoundResponse {
    private double accuracy;
    private int score;
    private HslColorDto targetColor;
    private HslColorDto submittedColor;
    @JsonProperty("isMatchComplete")
    private boolean isMatchComplete;
    private Integer nextRoundNumber;
}
