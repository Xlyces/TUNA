import { BigInt } from "@graphprotocol/graph-ts";
import {
  TutorMinted,
  CredentialsStored,
  LessonCompleted,
} from "../generated/TutorReputation/TutorReputation";
import { Tutor, Lesson, Credential } from "../generated/schema";

export function handleTutorMinted(event: TutorMinted): void {
  let tutor = new Tutor(event.params.tokenId.toString());
  tutor.id = event.params.tokenId.toString();
  tutor.address = event.params.tutor;
  tutor.mintedAt = event.block.timestamp;
  tutor.totalHours = BigInt.fromI32(0);
  tutor.totalEarnings = BigInt.fromI32(0);
  tutor.averageRating = BigInt.fromI32(0).toBigDecimal();
  tutor.lessonCount = BigInt.fromI32(0);
  tutor.save();
}

export function handleCredentialsStored(event: CredentialsStored): void {
  let tutor = Tutor.load(event.params.tokenId.toString());
  if (tutor == null) {
    tutor = new Tutor(event.params.tokenId.toString());
    tutor.id = event.params.tokenId.toString();
    tutor.mintedAt = event.block.timestamp;
    tutor.totalHours = BigInt.fromI32(0);
    tutor.totalEarnings = BigInt.fromI32(0);
    tutor.averageRating = BigInt.fromI32(0).toBigDecimal();
    tutor.lessonCount = BigInt.fromI32(0);
  }

  tutor.credHash = event.params.credHash;
  tutor.examType = event.params.examType;
  tutor.save();

  let credential = new Credential(event.params.tokenId.toString());
  credential.id = event.params.tokenId.toString();
  credential.tutor = tutor.id;
  credential.credHash = event.params.credHash;
  credential.examType = event.params.examType;
  credential.storedAt = event.block.timestamp;
  credential.save();
}

export function handleLessonCompleted(event: LessonCompleted): void {
  let tutor = Tutor.load(event.params.tutorId.toString());
  if (tutor == null) {
    tutor = new Tutor(event.params.tutorId.toString());
    tutor.id = event.params.tutorId.toString();
    tutor.mintedAt = event.block.timestamp;
    tutor.totalHours = BigInt.fromI32(0);
    tutor.totalEarnings = BigInt.fromI32(0);
    tutor.averageRating = BigInt.fromI32(0).toBigDecimal();
    tutor.lessonCount = BigInt.fromI32(0);
  }

  // Create lesson entity
  let lessonId = `${event.params.tutorId.toString()}-${event.params.timestamp.toString()}-${event.params.paymentHash.toHexString()}`;
  let lesson = new Lesson(lessonId);
  lesson.id = lessonId;
  lesson.tutor = tutor.id;
  lesson.tutorId = event.params.tutorId;
  lesson.timestamp = event.params.timestamp;
  lesson.durationMins = event.params.durationMins;
  lesson.feeHkd = event.params.feeHkd;
  lesson.subjectId = event.params.subjectId;
  lesson.rating = event.params.rating;
  lesson.paymentHash = event.params.paymentHash;
  lesson.save();

  // Update tutor statistics
  tutor.lessonCount = tutor.lessonCount.plus(BigInt.fromI32(1));
  tutor.totalHours = tutor.totalHours.plus(BigInt.fromI32(event.params.durationMins / 60));
  tutor.totalEarnings = tutor.totalEarnings.plus(event.params.feeHkd);

  // Calculate average rating
  let totalRating = tutor.averageRating.times(tutor.lessonCount.minus(BigInt.fromI32(1)).toBigDecimal());
  totalRating = totalRating.plus(BigInt.fromI32(event.params.rating).toBigDecimal());
  tutor.averageRating = totalRating.div(tutor.lessonCount.toBigDecimal());

  tutor.save();
}

