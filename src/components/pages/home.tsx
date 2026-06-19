import { ContactModalProvider } from "@/context/contact-modal-context";
import { ContactModal } from "@/components/ui/contact-modal";

import { Cta } from "../sections/cta";
import { Faq } from "../sections/faq";
import { Features } from "../sections/features";
import { Footer } from "../sections/footer";
import { Hero } from "../sections/hero";
import { Navbar } from "../sections/navbar";
import { Newsletter } from "../sections/newsletter";

const Home = () => {
  return (
    <ContactModalProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Faq />
        <Cta />
        <Newsletter />
      </main>
      <Footer />

      {/* Rendered once — any component can open it via useContactModal() */}
      <ContactModal />
    </ContactModalProvider>
  );
};

export default Home;
