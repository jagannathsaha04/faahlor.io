package com.faahlor.service;

import com.faahlor.dto.*;
import com.faahlor.exception.InvalidGameStateException;
import com.faahlor.exception.MatchNotFoundException;
import com.faahlor.mapper.HslColorMapper;
import com.faahlor.model.HslColor;
import com.faahlor.model.Match;
import com.faahlor.model.Round;
import com.faahlor.repository.MatchRepository;
import com.faahlor.repository.RoundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final RoundRepository roundRepository;
    private final RoundService roundService;
    private final HslColorMapper colorMapper;

    @Transactional
    public CreateMatchResponse createMatch() {
        Match match = new Match();
        match = matchRepository.save(match);

        for (int i = 1; i <= roundService.getTotalRounds(); i++) {
            roundService.createRound(match, i);
        }

        return new CreateMatchResponse(match.getId());
    }

    @Transactional(readOnly = true)
    public CurrentRoundResponse getCurrentRound(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchNotFoundException(matchId.toString()));

        if (match.getCompletedAt() != null) {
            throw new InvalidGameStateException("Match is already complete");
        }

        Round round = roundService.getCurrentRound(matchId);

        return new CurrentRoundResponse(
                matchId,
                round.getRoundNumber(),
                colorMapper.toDto(round.getTargetColor())
        );
    }

    @Transactional
    public SubmitRoundResponse submitRound(SubmitRoundRequest request) {
        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new MatchNotFoundException(request.getMatchId().toString()));

        if (match.getCompletedAt() != null) {
            throw new InvalidGameStateException("Match is already complete");
        }

        // Saturation is always 1.0 — only hue and brightness are user-controlled
        HslColor submittedColor = new HslColor(request.getHue(), 1.0, request.getBrightness());
        Round submitted = roundService.submitRound(request.getMatchId(), request.getRoundNumber(), submittedColor);

        List<Round> allRounds = roundRepository.findByMatchIdOrderByRoundNumberAsc(request.getMatchId());
        boolean allSubmitted = allRounds.stream().allMatch(Round::isSubmitted);

        Integer nextRoundNumber = null;
        boolean matchComplete = false;

        if (allSubmitted) {
            int totalScore = allRounds.stream().mapToInt(Round::getScore).sum();
            match.setTotalScore(totalScore);
            match.setCompletedAt(Instant.now());
            matchRepository.save(match);
            matchComplete = true;
        } else {
            nextRoundNumber = request.getRoundNumber() + 1;
        }

        return new SubmitRoundResponse(
                submitted.getAccuracy(),
                submitted.getScore(),
                colorMapper.toDto(submitted.getTargetColor()),
                colorMapper.toDto(submitted.getSubmittedColor()),
                matchComplete,
                nextRoundNumber
        );
    }

    @Transactional(readOnly = true)
    public MatchSummaryResponse getMatchSummary(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchNotFoundException(matchId.toString()));

        if (match.getCompletedAt() == null) {
            throw new InvalidGameStateException("Match is not yet complete");
        }

        List<Round> rounds = roundRepository.findByMatchIdOrderByRoundNumberAsc(matchId);

        double averageAccuracy = rounds.stream()
                .mapToDouble(Round::getAccuracy)
                .average()
                .orElse(0.0);

        List<MatchSummaryResponse.RoundSummary> roundSummaries = rounds.stream()
                .map(r -> new MatchSummaryResponse.RoundSummary(
                        r.getRoundNumber(),
                        colorMapper.toDto(r.getTargetColor()),
                        colorMapper.toDto(r.getSubmittedColor()),
                        r.getAccuracy(),
                        r.getScore()
                ))
                .toList();

        return new MatchSummaryResponse(matchId, match.getTotalScore(), averageAccuracy, roundSummaries);
    }
}
