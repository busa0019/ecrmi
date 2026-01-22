import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Participant from "@/models/Participant";

export async function GET() {
  await connectDB();

  const certs = await Certificate.find({
    participantEmail: { $exists: false },
  });

  let updated = 0;

  for (const cert of certs) {
    const participant = await Participant.findOne({
      name: cert.participantName,
    });

    if (participant) {
      cert.participantEmail = participant.email.toLowerCase();
      await cert.save();
      updated++;
    }
  }

  return Response.json({
    fixed: updated,
    total: certs.length,
  });
}