const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TutorReputation", function () {
  let tutorReputation;
  let owner;
  let tutor;
  let otherAccount;
  const credHash = ethers.keccak256(ethers.toUtf8Bytes("test-credentials"));
  const examType = 0; // DSE

  beforeEach(async function () {
    [owner, tutor, otherAccount] = await ethers.getSigners();

    const TutorReputation = await ethers.getContractFactory("TutorReputation");
    tutorReputation = await TutorReputation.deploy();
    await tutorReputation.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tutorReputation.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await tutorReputation.name()).to.equal("TutorReputation");
      expect(await tutorReputation.symbol()).to.equal("TUTOR");
    });

    it("Should start with token ID 0", async function () {
      expect(await tutorReputation.nextTokenId()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a new tutor SBT", async function () {
      const tx = await tutorReputation.mintTutor(tutor.address, credHash, examType);
      await expect(tx).to.emit(tutorReputation, "TutorMinted").withArgs(0, tutor.address);
      await expect(tx).to.emit(tutorReputation, "CredentialsStored").withArgs(0, credHash, examType);

      expect(await tutorReputation.ownerOf(0)).to.equal(tutor.address);
      expect(await tutorReputation.credHashes(0)).to.equal(credHash);
      expect(await tutorReputation.examTypes(0)).to.equal(examType);
      expect(await tutorReputation.nextTokenId()).to.equal(1);
    });

    it("Should increment token ID on each mint", async function () {
      await tutorReputation.mintTutor(tutor.address, credHash, examType);
      await tutorReputation.mintTutor(otherAccount.address, credHash, examType);

      expect(await tutorReputation.nextTokenId()).to.equal(2);
      expect(await tutorReputation.ownerOf(0)).to.equal(tutor.address);
      expect(await tutorReputation.ownerOf(1)).to.equal(otherAccount.address);
    });

    it("Should reject minting with zero address", async function () {
      await expect(
        tutorReputation.mintTutor(ethers.ZeroAddress, credHash, examType)
      ).to.be.revertedWith("Invalid tutor address");
    });

    it("Should reject minting with invalid exam type", async function () {
      await expect(
        tutorReputation.mintTutor(tutor.address, credHash, 2)
      ).to.be.revertedWith("Invalid exam type");
    });

    it("Should only allow owner to mint", async function () {
      await expect(
        tutorReputation.connect(tutor).mintTutor(tutor.address, credHash, examType)
      ).to.be.revertedWithCustomError(tutorReputation, "OwnableUnauthorizedAccount");
    });
  });

  describe("Lesson Logging", function () {
    let tutorId;
    let paymentHash;

    beforeEach(async function () {
      await tutorReputation.mintTutor(tutor.address, credHash, examType);
      tutorId = 0;
      paymentHash = ethers.keccak256(ethers.toUtf8Bytes("payment-1"));
    });

    it("Should log a lesson successfully", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 50000, // HKD 500.00
        subjectId: 1,
        rating: 5,
      };

      const tx = await tutorReputation.logLesson(tutorId, lessonLog, paymentHash);
      await expect(tx)
        .to.emit(tutorReputation, "LessonCompleted")
        .withArgs(
          tutorId,
          lessonLog.timestamp,
          lessonLog.durationMins,
          lessonLog.feeHkd,
          lessonLog.subjectId,
          lessonLog.rating,
          paymentHash
        );

      expect(await tutorReputation.paymentHashes(paymentHash)).to.be.true;
      expect(await tutorReputation.getLessonCount(tutorId)).to.equal(1);
    });

    it("Should prevent duplicate payment logging", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 50000,
        subjectId: 1,
        rating: 5,
      };

      await tutorReputation.logLesson(tutorId, lessonLog, paymentHash);

      await expect(
        tutorReputation.logLesson(tutorId, lessonLog, paymentHash)
      ).to.be.revertedWith("Payment already logged");
    });

    it("Should reject invalid rating", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 50000,
        subjectId: 1,
        rating: 6, // Invalid
      };

      await expect(
        tutorReputation.logLesson(tutorId, lessonLog, paymentHash)
      ).to.be.revertedWith("Invalid rating");
    });

    it("Should reject zero duration", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 0,
        feeHkd: 50000,
        subjectId: 1,
        rating: 5,
      };

      await expect(
        tutorReputation.logLesson(tutorId, lessonLog, paymentHash)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should reject zero fee", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 0,
        subjectId: 1,
        rating: 5,
      };

      await expect(
        tutorReputation.logLesson(tutorId, lessonLog, paymentHash)
      ).to.be.revertedWith("Invalid fee");
    });

    it("Should reject logging for non-existent tutor", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 50000,
        subjectId: 1,
        rating: 5,
      };

      await expect(
        tutorReputation.logLesson(999, lessonLog, paymentHash)
      ).to.be.revertedWith("Tutor does not exist");
    });
  });

  describe("Statistics", function () {
    let tutorId;

    beforeEach(async function () {
      await tutorReputation.mintTutor(tutor.address, credHash, examType);
      tutorId = 0;
    });

    it("Should return zero stats for tutor with no lessons", async function () {
      const [totalHrs, totEarn, avgRate, count] = await tutorReputation.getStats(tutorId);
      expect(totalHrs).to.equal(0);
      expect(totEarn).to.equal(0);
      expect(avgRate).to.equal(0);
      expect(count).to.equal(0);
    });

    it("Should calculate correct statistics", async function () {
      const lessons = [
        {
          timestamp: Math.floor(Date.now() / 1000),
          durationMins: 60,
          feeHkd: 50000,
          subjectId: 1,
          rating: 5,
        },
        {
          timestamp: Math.floor(Date.now() / 1000) + 3600,
          durationMins: 90,
          feeHkd: 75000,
          subjectId: 2,
          rating: 4,
        },
        {
          timestamp: Math.floor(Date.now() / 1000) + 7200,
          durationMins: 60,
          feeHkd: 50000,
          subjectId: 1,
          rating: 5,
        },
      ];

      for (let i = 0; i < lessons.length; i++) {
        const paymentHash = ethers.keccak256(ethers.toUtf8Bytes(`payment-${i}`));
        await tutorReputation.logLesson(tutorId, lessons[i], paymentHash);
      }

      const [totalHrs, totEarn, avgRate, count] = await tutorReputation.getStats(tutorId);

      expect(count).to.equal(3);
      expect(totalHrs).to.equal(3); // (60 + 90 + 60) / 60 = 3.5, but integer division = 3
      expect(totEarn).to.equal(175000); // 50000 + 75000 + 50000
      expect(avgRate).to.equal(4); // (5 + 4 + 5) / 3 = 4.67, but integer division = 4
    });

    it("Should retrieve individual lesson logs", async function () {
      const lessonLog = {
        timestamp: Math.floor(Date.now() / 1000),
        durationMins: 60,
        feeHkd: 50000,
        subjectId: 1,
        rating: 5,
      };

      const paymentHash = ethers.keccak256(ethers.toUtf8Bytes("payment-1"));
      await tutorReputation.logLesson(tutorId, lessonLog, paymentHash);

      const retrievedLog = await tutorReputation.getLessonLog(tutorId, 0);
      expect(retrievedLog.timestamp).to.equal(lessonLog.timestamp);
      expect(retrievedLog.durationMins).to.equal(lessonLog.durationMins);
      expect(retrievedLog.feeHkd).to.equal(lessonLog.feeHkd);
      expect(retrievedLog.subjectId).to.equal(lessonLog.subjectId);
      expect(retrievedLog.rating).to.equal(lessonLog.rating);
    });
  });

  describe("Soulbound Token (Non-transferable)", function () {
    beforeEach(async function () {
      await tutorReputation.mintTutor(tutor.address, credHash, examType);
    });

    it("Should prevent token transfer", async function () {
      await expect(
        tutorReputation.connect(tutor).transferFrom(tutor.address, otherAccount.address, 0)
      ).to.be.revertedWith("Token is soulbound and non-transferable");
    });

    it("Should prevent safe transfer", async function () {
      await expect(
        tutorReputation.connect(tutor).safeTransferFrom(tutor.address, otherAccount.address, 0)
      ).to.be.revertedWith("Token is soulbound and non-transferable");
    });

    it("Should prevent approval", async function () {
      await expect(
        tutorReputation.connect(tutor).approve(otherAccount.address, 0)
      ).to.be.revertedWith("Token is soulbound and non-transferable");
    });

    it("Should prevent setApprovalForAll", async function () {
      await expect(
        tutorReputation.connect(tutor).setApprovalForAll(otherAccount.address, true)
      ).to.be.revertedWith("Token is soulbound and non-transferable");
    });
  });
});

