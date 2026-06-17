package com.faahlor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MatchControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ─── POST /api/matches ───────────────────────────────────────────────────

    @Test
    void createMatch_returns201WithMatchId() throws Exception {
        mockMvc.perform(post("/api/matches"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.matchId").isNotEmpty());
    }

    // ─── GET /api/matches/{id}/round/current ─────────────────────────────────

    @Test
    void getCurrentRound_returnsRound1WithTargetColor() throws Exception {
        String matchId = createMatchId();

        mockMvc.perform(get("/api/matches/{id}/round/current", matchId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchId").value(matchId))
                .andExpect(jsonPath("$.roundNumber").value(1))
                .andExpect(jsonPath("$.targetColor.hue").isNumber())
                .andExpect(jsonPath("$.targetColor.saturation").value(1.0))
                .andExpect(jsonPath("$.targetColor.brightness").isNumber());
    }

    @Test
    void getCurrentRound_unknownMatch_returns404() throws Exception {
        mockMvc.perform(get("/api/matches/{id}/round/current", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("MATCH_NOT_FOUND"));
    }

    // ─── POST /api/rounds/submit ──────────────────────────────────────────────

    @Test
    void submitRound_validSubmission_returnsAccuracyAndScore() throws Exception {
        String matchId = createMatchId();

        Map<String, Object> request = Map.of(
                "matchId", matchId,
                "roundNumber", 1,
                "hue", 120.0,
                "brightness", 0.5
        );

        mockMvc.perform(post("/api/rounds/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accuracy").isNumber())
                .andExpect(jsonPath("$.score").isNumber())
                .andExpect(jsonPath("$.targetColor").isMap())
                .andExpect(jsonPath("$.submittedColor.hue").value(120.0))
                .andExpect(jsonPath("$.submittedColor.saturation").value(1.0))
                .andExpect(jsonPath("$.submittedColor.brightness").value(0.5))
                .andExpect(jsonPath("$.isMatchComplete").value(false))
                .andExpect(jsonPath("$.nextRoundNumber").value(2));
    }

    @Test
    void submitRound_duplicateSubmission_returns409() throws Exception {
        String matchId = createMatchId();
        Map<String, Object> request = Map.of(
                "matchId", matchId,
                "roundNumber", 1,
                "hue", 120.0,
                "brightness", 0.5
        );
        String body = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/rounds/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/rounds/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_GAME_STATE"));
    }

    @Test
    void submitRound_invalidHue_returns400() throws Exception {
        String matchId = createMatchId();
        Map<String, Object> request = Map.of(
                "matchId", matchId,
                "roundNumber", 1,
                "hue", 400.0,
                "brightness", 0.5
        );

        mockMvc.perform(post("/api/rounds/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void submitRound_invalidBrightness_returns400() throws Exception {
        String matchId = createMatchId();
        Map<String, Object> request = Map.of(
                "matchId", matchId,
                "roundNumber", 1,
                "hue", 120.0,
                "brightness", 1.5
        );

        mockMvc.perform(post("/api/rounds/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void submitRound_unknownMatch_returns404() throws Exception {
        Map<String, Object> request = Map.of(
                "matchId", UUID.randomUUID().toString(),
                "roundNumber", 1,
                "hue", 120.0,
                "brightness", 0.5
        );

        mockMvc.perform(post("/api/rounds/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // ─── Full 5-round match flow ──────────────────────────────────────────────

    @Test
    void completeMatch_5rounds_setsMatchCompleteAndTotalScore() throws Exception {
        String matchId = createMatchId();

        for (int round = 1; round <= 5; round++) {
            Map<String, Object> request = Map.of(
                    "matchId", matchId,
                    "roundNumber", round,
                    "hue", 180.0,
                    "brightness", 0.5
            );
            MvcResult result = mockMvc.perform(post("/api/rounds/submit")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andReturn();

            String json = result.getResponse().getContentAsString();
            if (round < 5) {
                assertThat(json).contains("\"isMatchComplete\":false");
                assertThat(json).contains("\"nextRoundNumber\":" + (round + 1));
            } else {
                assertThat(json).contains("\"isMatchComplete\":true");
            }
        }

        // Summary now available
        mockMvc.perform(get("/api/matches/{id}/summary", matchId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchId").value(matchId))
                .andExpect(jsonPath("$.totalScore").isNumber())
                .andExpect(jsonPath("$.averageAccuracy").isNumber())
                .andExpect(jsonPath("$.rounds").isArray())
                .andExpect(jsonPath("$.rounds", hasSize(5)));
    }

    @Test
    void submitAfterMatchComplete_returns409() throws Exception {
        String matchId = createMatchId();

        for (int round = 1; round <= 5; round++) {
            Map<String, Object> request = Map.of(
                    "matchId", matchId,
                    "roundNumber", round,
                    "hue", 90.0,
                    "brightness", 0.5
            );
            mockMvc.perform(post("/api/rounds/submit")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        Map<String, Object> extra = Map.of(
                "matchId", matchId,
                "roundNumber", 1,
                "hue", 90.0,
                "brightness", 0.5
        );
        mockMvc.perform(post("/api/rounds/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(extra)))
                .andExpect(status().isConflict());
    }

    // ─── GET /api/matches/{id}/summary ───────────────────────────────────────

    @Test
    void getSummary_incompleteMatch_returns409() throws Exception {
        String matchId = createMatchId();

        mockMvc.perform(get("/api/matches/{id}/summary", matchId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_GAME_STATE"));
    }

    @Test
    void getSummary_unknownMatch_returns404() throws Exception {
        mockMvc.perform(get("/api/matches/{id}/summary", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String createMatchId() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/matches"))
                .andExpect(status().isCreated())
                .andReturn();
        Map<?, ?> map = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return map.get("matchId").toString();
    }
}
