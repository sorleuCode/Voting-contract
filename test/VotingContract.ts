import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect, should } from "chai";
  import { ethers } from "hardhat";
  import "@nomicfoundation/hardhat-toolbox";
  import "@nomicfoundation/hardhat-ethers";

describe("VotingSystem", function () {

    const candidateNames = ["Alice", "Bob", "Charlie"];
    const candidateParties = ["PartyA", "PartyB", "PartyC"];
    const electionDuration = 1;



    async function deployVotingContractsFixture() {

        const [owner, voter1, voter2] = await ethers.getSigners();

        const candidateNames = ["Alice", "Bob", "Charlie"];
        const candidateParties = ["PartyA", "PartyB", "PartyC"];
        const electionDuration = 1;
        const VotingSystemFactory = await ethers.getContractFactory("VotingSystem");
        const votingSystem = await VotingSystemFactory.deploy(candidateNames, candidateParties, electionDuration);


        return { votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2, };
    }

    

    it("should initialize with correct candidates", async function () {

        const {votingSystem} =  await loadFixture(deployVotingContractsFixture);
        for (let i = 0; i < candidateNames.length; i++) {
            const candidate = await votingSystem.candidates(i);
            expect(candidate.name).to.equal(candidateNames[i]);
            expect(candidate.party).to.equal(candidateParties[i]);
            expect(candidate.voteCount).to.equal(0);
        }
    });

    it("should allow a user to vote and increment vote count", async function () {

        const {votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2,} =  await loadFixture(deployVotingContractsFixture);

        await votingSystem.connect(voter1).vote(1)
        const candidate = await votingSystem.candidates(1);
        expect(candidate.voteCount).to.equal(1);

        const hasVoted = await votingSystem.voters(voter1.address);
        expect(hasVoted).to.be.true;
    });

    it("should prevent double voting by the same user", async function () {
        const {votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2,} =  await loadFixture(deployVotingContractsFixture);

        await votingSystem.connect(voter1).vote(1); // Voter1 votes for Bob
        await expect(votingSystem.connect(voter1).vote(1)).to.be.revertedWith("You have already voted.");
    });

    it("should prevent voting after election ends", async function () {
        const {votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2,} =  await loadFixture(deployVotingContractsFixture);

        await ethers.provider.send("evm_increaseTime", [electionDuration * 60 * 60]);
        await ethers.provider.send("evm_mine");

        await expect(votingSystem.connect(voter1).vote(1)).to.be.revertedWith("Election has ended.");
    });

    it("should calculate the winner correctly", async function () {
        const {votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2,} =  await loadFixture(deployVotingContractsFixture);

        await votingSystem.connect(voter1).vote(0);
        await votingSystem.connect(voter2).vote(0); 

        await ethers.provider.send("evm_increaseTime", [electionDuration * 60 * 60]);
        await ethers.provider.send("evm_mine");

        const winnerDetails = await votingSystem.getWinnerDetails();
        expect(winnerDetails.name).to.equal("Alice");
        expect(winnerDetails.party).to.equal("PartyA");
        expect(winnerDetails.voteCount).to.equal(2);
    });

    it("should allow only the manager to retrieve winner details", async function () {
        const {votingSystem, candidateNames, candidateParties, electionDuration,  owner, voter1, voter2,} =  await loadFixture(deployVotingContractsFixture);

        await ethers.provider.send("evm_increaseTime", [electionDuration * 60 * 60]);
        await ethers.provider.send("evm_mine");

        await expect(votingSystem.connect(voter1).getWinnerDetails()).to.be.revertedWith("Only manager can perform this action.");
    });
});
