package com.faahlor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "round")
@Getter
@Setter
@NoArgsConstructor
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @Column(name = "target_hue", nullable = false)
    private double targetHue;

    @Column(name = "target_saturation", nullable = false)
    private double targetSaturation;

    @Column(name = "target_brightness", nullable = false)
    private double targetBrightness;

    @Column(name = "submitted_hue")
    private Double submittedHue;

    @Column(name = "submitted_saturation")
    private Double submittedSaturation;

    @Column(name = "submitted_brightness")
    private Double submittedBrightness;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "score")
    private Integer score;

    public HslColor getTargetColor() {
        return new HslColor(targetHue, targetSaturation, targetBrightness);
    }

    public void setTargetColor(HslColor color) {
        this.targetHue = color.getHue();
        this.targetSaturation = color.getSaturation();
        this.targetBrightness = color.getBrightness();
    }

    public HslColor getSubmittedColor() {
        if (submittedHue == null) return null;
        return new HslColor(submittedHue, submittedSaturation, submittedBrightness);
    }

    public void setSubmittedColor(HslColor color) {
        this.submittedHue = color.getHue();
        this.submittedSaturation = color.getSaturation();
        this.submittedBrightness = color.getBrightness();
    }

    public boolean isSubmitted() {
        return submittedHue != null;
    }
}
