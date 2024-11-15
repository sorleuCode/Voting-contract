// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {VotingLibrary} from "./VotingLibrary.sol";


contract VotingSystem {
    using VotingLibrary for VotingLibrary.Candidate[];

    VotingLibrary.Candidate[] public candidates;
    address public manager;
    mapping(address => bool) public voters;
    uint public electionEnd;

    modifier restricted() {
        require(msg.sender == manager, "Only manager can perform this action.");
        _;
    }

    modifier ongoingElection() {
        require(block.timestamp < electionEnd, "Election has ended.");
        _;
    }

    
    constructor(string[] memory candidateNames, string[] memory candidateParties, uint duration) {
        require(candidateNames.length == candidateParties.length, "Mismatched candidates and parties.");
        manager = msg.sender;
        electionEnd = block.timestamp + (duration * 1 hours);

        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(VotingLibrary.Candidate({
                name: candidateNames[i],
                party: candidateParties[i],
                voteCount: 0
            }));
        }
    }

    
    function vote(uint candidateIndex) public ongoingElection {
        require(!voters[msg.sender], "You have already voted.");
        require(candidateIndex < candidates.length, "Invalid candidate index.");

        voters[msg.sender] = true;
        candidates[candidateIndex].voteCount++;
    }

    
    function getWinnerDetails()
        public
        view
        restricted
        returns (string memory name, string memory party, uint voteCount)
    {
        require(block.timestamp >= electionEnd, "Election is still ongoing.");
        return candidates.getWinner();
    }
}
