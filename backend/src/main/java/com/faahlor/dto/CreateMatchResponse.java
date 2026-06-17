package com.faahlor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateMatchResponse {
    private UUID matchId;
}
