package com.faahlor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CurrentRoundResponse {
    private UUID matchId;
    private int roundNumber;
    private HslColorDto targetColor;
}
