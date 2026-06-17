package com.faahlor.service;

import com.faahlor.exception.InvalidGameStateException;
import com.faahlor.exception.RoundNotFoundException;
import com.faahlor.model.HslColor;
import com.faahlor.model.Match;
import com.faahlor.model.Round;
import com.faahlor.repository.RoundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoundService {

    private static final int TOTAL_ROUNDS = 5;

    private final RoundRepository roundRepository;
    private final ColorGenerationService colorGenerationService;
    private final ScoringService scoringService;

    @Transactional
    public Round createRound(Match match, int roundNumber) {
        Round round = new Round();
        round.setMatch(match);
        round.setRoundNumber(roundNumber);
        round.setTargetColor(colorGenerationService.generateTargetColor());
        return roundRepository.save(round);
    }

    @Transactional(readOnly = true)
    public Round getCurrentRound(UUID matchId) {
        return roundRepository.findByMatchIdOrderByRoundNumberAsc(matchId)
                .stream()
                .filter(r -> !r.isSubmitted())
                .findFirst()
                .orElseThrow(() -> new InvalidGameStateException("No active round found for match: " + matchId));
    }

    @Transactional
    public Round submitRound(UUID matchId, int roundNumber, HslColor submittedColor) {
        Round round = roundRepository.findByMatchIdAndRoundNumber(matchId, roundNumber)
                .orElseThrow(() -> new RoundNotFoundException(matchId.toString(), roundNumber));

        if (round.isSubmitted()) {
            throw new InvalidGameStateException("Round " + roundNumber + " has already been submitted");
        }

        double accuracy = scoringService.calculateAccuracy(round.getTargetColor(), submittedColor);
        int score = scoringService.calculateScore(accuracy);

        round.setSubmittedColor(submittedColor);
        round.setAccuracy(accuracy);
        round.setScore(score);

        return roundRepository.save(round);
    }

    public int getTotalRounds() {
        return TOTAL_ROUNDS;
    }
}
