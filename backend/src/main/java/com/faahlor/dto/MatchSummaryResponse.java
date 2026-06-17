package com.faahlor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MatchSummaryResponse {
    private UUID matchId;
    private int totalScore;
    private double averageAccuracy;
    private List<RoundSummary> rounds;

    @Data
    @AllArgsConstructor
    public static class RoundSummary {
        private int roundNumber;
        private HslColorDto targetColor;
        private HslColorDto submittedColor;
        private double accuracy;
        private int score;
    }
}
