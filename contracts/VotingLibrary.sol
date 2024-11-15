// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;


library VotingLibrary {
    struct Candidate {
        string name;
        string party;
        uint voteCount;
    }

    
    function tallyVotes(Candidate[] storage candidates) internal view returns (uint winningIndex) {
        uint highestVoteCount = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }
    }

    
    function getWinner(Candidate[] storage candidates)
        internal
        view
        returns (string memory name, string memory party, uint voteCount)
    {
        uint winningIndex = tallyVotes(candidates);
        name = candidates[winningIndex].name;
        party = candidates[winningIndex].party;
        voteCount = candidates[winningIndex].voteCount;
    }
}