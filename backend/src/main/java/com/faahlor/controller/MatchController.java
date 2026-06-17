package com.faahlor.controller;

import com.faahlor.dto.*;
import com.faahlor.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/matches")
    public ResponseEntity<CreateMatchResponse> createMatch() {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.createMatch());
    }

    @GetMapping("/matches/{id}/round/current")
    public ResponseEntity<CurrentRoundResponse> getCurrentRound(@PathVariable UUID id) {
        return ResponseEntity.ok(matchService.getCurrentRound(id));
    }

    @PostMapping("/rounds/submit")
    public ResponseEntity<SubmitRoundResponse> submitRound(@Valid @RequestBody SubmitRoundRequest request) {
        return ResponseEntity.ok(matchService.submitRound(request));
    }

    @GetMapping("/matches/{id}/summary")
    public ResponseEntity<MatchSummaryResponse> getMatchSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(matchService.getMatchSummary(id));
    }
}
