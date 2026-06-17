package com.faahlor.exception;

public class MatchNotFoundException extends RuntimeException {
    public MatchNotFoundException(String matchId) {
        super("Match not found: " + matchId);
    }
}
