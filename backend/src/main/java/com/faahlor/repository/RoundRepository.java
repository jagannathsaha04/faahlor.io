package com.faahlor.repository;

import com.faahlor.model.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundRepository extends JpaRepository<Round, UUID> {

    List<Round> findByMatchIdOrderByRoundNumberAsc(UUID matchId);

    Optional<Round> findByMatchIdAndRoundNumber(UUID matchId, int roundNumber);
}
