const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require("hardhat");

describe("AapdaSetu", function () {
  const Status = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    RELEASED: 3,
  };

  const sampleDisaster = {
    disasterId: "DIS-ASSAM-2026-001",
    location: "Assam, India",
    severity: 5,
    confidenceScore: 92,
    recommendedAmount: 50000,
    aiDecisionHash: "sha256:4c2f8e8f-aapdasetu-ai-decision",
    metadataURI: "ipfs://bafy-aapdasetu-assam-001",
  };

  async function deployAapdaSetuFixture() {
    const [owner, approver, otherAccount] = await hre.ethers.getSigners();
    const AapdaSetu = await hre.ethers.getContractFactory("AapdaSetu");
    const aapdaSetu = await AapdaSetu.deploy();
    return { aapdaSetu, owner, approver, otherAccount };
  }

  async function deployWithStoredDisasterFixture() {
    const fixture = await deployAapdaSetuFixture();
    await fixture.aapdaSetu.storeDisaster(
      sampleDisaster.disasterId,
      sampleDisaster.location,
      sampleDisaster.severity,
      sampleDisaster.confidenceScore,
      sampleDisaster.recommendedAmount,
      sampleDisaster.aiDecisionHash,
      sampleDisaster.metadataURI
    );
    return fixture;
  }

  describe("Deployment", function () {
    it("sets the deployer as owner and default approver", async function () {
      const { aapdaSetu, owner } = await loadFixture(deployAapdaSetuFixture);

      expect(await aapdaSetu.owner()).to.equal(owner.address);
      expect(await aapdaSetu.governmentApprovers(owner.address)).to.equal(true);
    });
  });

  describe("Approver access", function () {
    it("lets the owner add and remove government approvers", async function () {
      const { aapdaSetu, approver } = await loadFixture(deployAapdaSetuFixture);

      await expect(aapdaSetu.addApprover(approver.address))
        .to.emit(aapdaSetu, "ApproverAdded")
        .withArgs(approver.address);

      expect(await aapdaSetu.governmentApprovers(approver.address)).to.equal(true);

      await expect(aapdaSetu.removeApprover(approver.address))
        .to.emit(aapdaSetu, "ApproverRemoved")
        .withArgs(approver.address);

      expect(await aapdaSetu.governmentApprovers(approver.address)).to.equal(false);
    });

    it("blocks non-owners from adding approvers", async function () {
      const { aapdaSetu, approver, otherAccount } = await loadFixture(deployAapdaSetuFixture);

      await expect(
        aapdaSetu.connect(otherAccount).addApprover(approver.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Storing AI recommendations", function () {
    it("stores a disaster recommendation and emits an audit event", async function () {
      const { aapdaSetu, owner } = await loadFixture(deployAapdaSetuFixture);

      const tx = await aapdaSetu.storeDisaster(
        sampleDisaster.disasterId,
        sampleDisaster.location,
        sampleDisaster.severity,
        sampleDisaster.confidenceScore,
        sampleDisaster.recommendedAmount,
        sampleDisaster.aiDecisionHash,
        sampleDisaster.metadataURI
      );

      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(aapdaSetu, "DisasterStored")
        .withArgs(
          sampleDisaster.disasterId,
          sampleDisaster.location,
          sampleDisaster.severity,
          sampleDisaster.confidenceScore,
          sampleDisaster.recommendedAmount,
          sampleDisaster.aiDecisionHash,
          sampleDisaster.metadataURI,
          owner.address,
          block.timestamp
        );

      const disaster = await aapdaSetu.getDisaster(sampleDisaster.disasterId);
      expect(disaster.disasterId).to.equal(sampleDisaster.disasterId);
      expect(disaster.location).to.equal(sampleDisaster.location);
      expect(disaster.status).to.equal(Status.PENDING);
      expect(disaster.aiDecisionHash).to.equal(sampleDisaster.aiDecisionHash);
    });

    it("records initial history when a disaster is stored", async function () {
      const { aapdaSetu, owner } = await loadFixture(deployWithStoredDisasterFixture);

      const history = await aapdaSetu.getHistory(sampleDisaster.disasterId);
      expect(history.length).to.equal(1);
      expect(history[0].status).to.equal(Status.PENDING);
      expect(history[0].note).to.equal("AI recommendation stored");
      expect(history[0].actor).to.equal(owner.address);
    });

    it("rejects duplicate disaster IDs", async function () {
      const { aapdaSetu } = await loadFixture(deployWithStoredDisasterFixture);

      await expect(
        aapdaSetu.storeDisaster(
          sampleDisaster.disasterId,
          sampleDisaster.location,
          sampleDisaster.severity,
          sampleDisaster.confidenceScore,
          sampleDisaster.recommendedAmount,
          sampleDisaster.aiDecisionHash,
          sampleDisaster.metadataURI
        )
      ).to.be.revertedWith("Disaster ID already exists");
    });

    it("validates severity, confidence score, and AI decision hash", async function () {
      const { aapdaSetu } = await loadFixture(deployAapdaSetuFixture);

      await expect(
        aapdaSetu.storeDisaster("DIS-1", "Assam", 0, 90, 1000, "sha256:test", "")
      ).to.be.revertedWith("Severity must be between 1 and 5");

      await expect(
        aapdaSetu.storeDisaster("DIS-2", "Assam", 5, 101, 1000, "sha256:test", "")
      ).to.be.revertedWith("Confidence score must be between 0 and 100");

      await expect(
        aapdaSetu.storeDisaster("DIS-3", "Assam", 5, 90, 1000, "", "")
      ).to.be.revertedWith("AI decision hash is required");
    });
  });

  describe("Approval workflow", function () {
    it("allows an approver to approve a pending recommendation", async function () {
      const { aapdaSetu, approver } = await loadFixture(deployWithStoredDisasterFixture);
      await aapdaSetu.addApprover(approver.address);

      await expect(
        aapdaSetu.connect(approver).approveRecommendation(sampleDisaster.disasterId, "Approved by district office")
      ).to.emit(aapdaSetu, "RecommendationApproved");

      const disaster = await aapdaSetu.getDisaster(sampleDisaster.disasterId);
      expect(disaster.status).to.equal(Status.APPROVED);
      expect(disaster.approvedBy).to.equal(approver.address);
    });

    it("blocks non-approvers from approving recommendations", async function () {
      const { aapdaSetu, otherAccount } = await loadFixture(deployWithStoredDisasterFixture);

      await expect(
        aapdaSetu.connect(otherAccount).approveRecommendation(sampleDisaster.disasterId, "Trying to approve")
      ).to.be.revertedWith("Only government approver can call this function");
    });

    it("allows an approver to reject a pending recommendation with a reason", async function () {
      const { aapdaSetu, approver } = await loadFixture(deployWithStoredDisasterFixture);
      await aapdaSetu.addApprover(approver.address);

      await expect(
        aapdaSetu.connect(approver).rejectRecommendation(sampleDisaster.disasterId, "Duplicate claim suspected")
      ).to.emit(aapdaSetu, "RecommendationRejected");

      const disaster = await aapdaSetu.getDisaster(sampleDisaster.disasterId);
      expect(disaster.status).to.equal(Status.REJECTED);
      expect(disaster.approvedBy).to.equal(approver.address);
    });

    it("does not allow rejection without a reason", async function () {
      const { aapdaSetu } = await loadFixture(deployWithStoredDisasterFixture);

      await expect(
        aapdaSetu.rejectRecommendation(sampleDisaster.disasterId, "")
      ).to.be.revertedWith("Rejection reason is required");
    });
  });

  describe("Release and history", function () {
    it("marks approved relief as released without transferring ETH", async function () {
      const { aapdaSetu } = await loadFixture(deployWithStoredDisasterFixture);

      await aapdaSetu.approveRecommendation(sampleDisaster.disasterId, "Approved");

      await expect(
        aapdaSetu.releaseFunds(sampleDisaster.disasterId, "Bank transfer initiated off-chain")
      ).to.emit(aapdaSetu, "FundsMarkedReleased");

      const disaster = await aapdaSetu.getDisaster(sampleDisaster.disasterId);
      expect(disaster.status).to.equal(Status.RELEASED);
    });

    it("blocks release before approval", async function () {
      const { aapdaSetu } = await loadFixture(deployWithStoredDisasterFixture);

      await expect(
        aapdaSetu.releaseFunds(sampleDisaster.disasterId, "Too early")
      ).to.be.revertedWith("Disaster is not approved");
    });

    it("returns complete status history", async function () {
      const { aapdaSetu } = await loadFixture(deployWithStoredDisasterFixture);

      await aapdaSetu.approveRecommendation(sampleDisaster.disasterId, "Approved");
      await aapdaSetu.releaseFunds(sampleDisaster.disasterId, "Released off-chain");

      const history = await aapdaSetu.getHistory(sampleDisaster.disasterId);
      expect(history.length).to.equal(3);
      expect(history[0].status).to.equal(Status.PENDING);
      expect(history[1].status).to.equal(Status.APPROVED);
      expect(history[2].status).to.equal(Status.RELEASED);
    });
  });

  describe("Read models", function () {
    it("returns all disaster IDs and count", async function () {
      const { aapdaSetu } = await loadFixture(deployAapdaSetuFixture);

      await aapdaSetu.storeDisaster("DIS-001", "Assam", 5, 92, 50000, "sha256:001", "ipfs://001");
      await aapdaSetu.storeDisaster("DIS-002", "Gujarat", 3, 88, 25000, "sha256:002", "ipfs://002");

      expect(await aapdaSetu.getDisasterCount()).to.equal(2);
      expect(await aapdaSetu.getAllDisasterIds()).to.deep.equal(["DIS-001", "DIS-002"]);
    });
  });
});
