// 🔒 SET A SAFE CUTOFF DATE (CHANGE THIS)
const CUTOFF_DATE = new Date("2026-01-01"); // before official launch

console.log("🧹 Cleaning test data created before", CUTOFF_DATE.toDateString());

const participants = await Participant.find({
  createdAt: { $lt: CUTOFF_DATE },
});

const emailsToDelete = participants.map((p: any) => p.email);

if (emailsToDelete.length === 0) {
  console.log("✅ No test users found before cutoff.");
  process.exit(0);
}

console.log("🗑 WILL DELETE", emailsToDelete.length, "users");
console.log(emailsToDelete);

// DELETE CERTS
await Certificate.deleteMany({
  participantEmail: { $in: emailsToDelete },
});

// DELETE ATTEMPTS
await Attempt.deleteMany({
  participantEmail: { $in: emailsToDelete },
});

// DELETE PARTICIPANTS
await Participant.deleteMany({
  email: { $in: emailsToDelete },
});

console.log("✅ Cleanup complete.");
process.exit(0);