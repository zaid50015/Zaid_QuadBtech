use ic_cdk::{api::caller, export::{candid::CandidType, Principal}};
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet};

#[derive(CandidType, Deserialize, Clone)]
struct Candidate {
    id: u32,         // Changed from Nat to u32 for Candid compatibility
    name: String,
    vote_count: u32, // Changed from Nat to u32
}

#[derive(CandidType, Deserialize)]
struct VotingSystem {
    candidates: BTreeMap<u32, Candidate>, // Key changed to u32
    voters: BTreeSet<Principal>,
}

impl Default for VotingSystem {
    fn default() -> Self {
        let mut candidates = BTreeMap::new();
        candidates.insert(
            1,
            Candidate {
                id: 1,
                name: "Alice".to_string(),
                vote_count: 0,
            },
        );
        candidates.insert(
            2,
            Candidate {
                id: 2,
                name: "Bob".to_string(),
                vote_count: 0,
            },
        );

        Self {
            candidates,
            voters: BTreeSet::new(),
        }
    }
}

#[derive(CandidType, Deserialize)]
enum VoteError {
    Unauthorized,
    AlreadyVoted,
    InvalidCandidate,
    InternalError(String),
}

thread_local! {
    static VOTING_SYSTEM: RefCell<VotingSystem> = RefCell::new(VotingSystem::default());
}

#[ic_cdk::update]
fn vote(candidate_id: u32) -> Result<(), VoteError> {
    let voter = caller();
    
    if Principal::anonymous() == voter {
        return Err(VoteError::Unauthorized);
    }

    VOTING_SYSTEM.with(|vs| {
        let mut system = vs.borrow_mut();

        if system.voters.contains(&voter) {
            return Err(VoteError::AlreadyVoted);
        }

        match system.candidates.get_mut(&candidate_id) {
            Some(candidate) => {
                candidate.vote_count = candidate.vote_count.checked_add(1)
                    .ok_or_else(|| VoteError::InternalError("Vote count overflow".to_string()))?;
                system.voters.insert(voter);
                Ok(())
            }
            None => Err(VoteError::InvalidCandidate),
        }
    })
}

#[ic_cdk::query]
fn get_results() -> Vec<Candidate> {
    VOTING_SYSTEM.with(|vs| {
        vs.borrow()
            .candidates
            .values()
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn has_voted(principal: Principal) -> bool {
    VOTING_SYSTEM.with(|vs| vs.borrow().voters.contains(&principal))
}