package com.faahlor.exception;

public class RoundNotFoundException extends RuntimeException {
    public RoundNotFoundException(String matchId, int roundNumber) {
        super("Round " + roundNumber + " not found for match: " + matchId);
    }
}
