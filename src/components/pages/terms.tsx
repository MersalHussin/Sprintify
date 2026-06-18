import { Navbar } from "@/components/sections/navbar";

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing or using Sprintify, you agree to these Terms of Service. If you do not agree, do not use the platform.",
  },
  {
    title: "2. Description of service",
    body: "Sprintify provides tools to organize team work, convert ideas into tasks, and collaborate in real time. Features may change as the product evolves.",
  },
  {
    title: "3. Accounts",
    body: "You are responsible for keeping your account credentials secure and for all activity under your account. Provide accurate information when registering.",
  },
  {
    title: "4. Acceptable use",
    body: "Do not misuse Sprintify, attempt unauthorized access, interfere with the service, or upload unlawful or harmful content.",
  },
  {
    title: "5. Intellectual property",
    body: "Sprintify and its branding, software, and content remain our property. You retain ownership of the content you submit, and grant us the rights needed to operate the service.",
  },
  {
    title: "6. Termination",
    body: "We may suspend or terminate access if these terms are violated or if required for security or legal reasons. You may stop using Sprintify at any time.",
  },
  {
    title: "7. Disclaimer",
    body: "Sprintify is provided on an \"as is\" basis without warranties of any kind, to the extent permitted by law.",
  },
  {
    title: "8. Contact",
    body: "Questions about these terms can be sent to legal@sprintify.app.",
  },
] as const;

const Terms = () => {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col gap-3">
          <h1 className="text-balance font-sans text-3xl font-medium text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-pretty font-sans text-base text-muted-foreground">
            Last updated: June 10, 2026
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-sans text-lg font-medium text-foreground">
                {section.title}
              </h2>
              <p className="mt-2 text-pretty font-sans text-base leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
};

export default Terms;
