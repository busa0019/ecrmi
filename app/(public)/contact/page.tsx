import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white px-4 py-20">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contact ECRMI
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            For enquiries related to training, assessments, certification,
            or verification, please reach us through the channels below.
          </p>
        </div>

        {/* INFO GRID */}
        <div className="grid sm:grid-cols-2 gap-8 mb-20">

          {/* ADDRESS */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-7 h-7 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  National Secretariat
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  3rd Floor (Left Wing), Bamboo Plaza,<br />
                  6/8 Ogunnusi Road, opposite NNPC Filling Station,<br />
                  Ogunnusi B/Stop, Omole/Ojodu,<br />
                  Lagos, Nigeria.
                </p>
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-start gap-4">
              <Mail className="w-7 h-7 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600">
                  <a
                    href="mailto:info@ecrmi.org.ng"
                    className="hover:underline"
                  >
                    info@ecrmi.org.ng
                  </a>
                </p>
                <p className="text-gray-600">
                  <a
                    href="mailto:registrarecrmi@yahoo.com"
                    className="hover:underline"
                  >
                    registrarecrmi@yahoo.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* PHONE */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-start gap-4">
              <Phone className="w-7 h-7 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Call Us
                </h3>
                <p className="text-gray-600">08055912022</p>
                <p className="text-gray-600">08039392687</p>
                <p className="text-gray-600">08168570185</p>
              </div>
            </div>
          </div>

          {/* HOURS */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-start gap-4">
              <Clock className="w-7 h-7 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Office Hours
                </h3>
                <p className="text-gray-600">
                  Monday – Saturday
                </p>
                <p className="text-gray-600">
                  8:00 AM – 5:00 PM
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* GOOGLE MAP */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <iframe
            title="ECRMI Location Map"
            src="https://www.google.com/maps?q=Bamboo%20Plaza%20Ogunnusi%20Road%20Omole%20Ojodu%20Lagos&output=embed"
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0"
          />
        </div>
      </div>
    </main>
  );
}