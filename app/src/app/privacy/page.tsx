export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-16 font-serif">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#8A847C] mb-10">Last updated: March 20, 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Overview</h2>
          <p className="text-[#3A3A3A] leading-relaxed">
            PPI (Pre-Purchase Intelligence) is a personal tool built by Truman Wilson for analyzing Bring a Trailer
            listings. This privacy policy describes how data is handled when you use this application.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Data We Collect</h2>
          <p className="text-[#3A3A3A] leading-relaxed mb-3">
            PPI collects only the minimum data necessary to function:
          </p>
          <ul className="list-disc list-inside text-[#3A3A3A] leading-relaxed space-y-2">
            <li>BaT listing URLs you submit for analysis</li>
            <li>Publicly available listing data fetched from Bring a Trailer</li>
            <li>WHOOP health data (recovery, strain, sleep) — only when you authorize the WHOOP integration</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">How We Use Your Data</h2>
          <ul className="list-disc list-inside text-[#3A3A3A] leading-relaxed space-y-2">
            <li>BaT listing data is used solely to generate the analysis report shown to you</li>
            <li>WHOOP data is used solely for personal health context and is never shared with third parties</li>
            <li>No data is sold, rented, or shared with any third party</li>
            <li>No data is stored on our servers beyond what is necessary to process your request</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">WHOOP Integration</h2>
          <p className="text-[#3A3A3A] leading-relaxed">
            If you choose to connect your WHOOP account, this application will access your recovery, strain, and sleep
            data via the WHOOP Developer API. This access requires your explicit authorization through WHOOP's OAuth
            flow. You may revoke access at any time through your WHOOP account settings. WHOOP data is used only for
            personal purposes and is never shared, sold, or disclosed to any third party.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Third-Party Services</h2>
          <p className="text-[#3A3A3A] leading-relaxed">
            PPI uses Anthropic's Claude API to generate report narratives. Listing text may be sent to Anthropic for
            processing. No personally identifiable information is included in these requests. Please refer to
            Anthropic's privacy policy for more information on how they handle data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Contact</h2>
          <p className="text-[#3A3A3A] leading-relaxed">
            Questions about this privacy policy? Reach out to{" "}
            <a href="mailto:trumanwilson@me.com" className="text-[#C0392B] hover:underline">
              trumanwilson@me.com
            </a>
            .
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-black/10">
          <a href="/" className="text-sm text-[#8A847C] hover:text-[#C0392B] transition-colors">
            ← Back to PPI
          </a>
        </div>
      </div>
    </main>
  );
}
