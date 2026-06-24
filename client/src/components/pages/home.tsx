

import { Cta } from "../sections/cta";
import { Faq } from "../sections/faq";
import { Features } from "../sections/features";
import { Footer } from "../sections/footer";
import { Hero } from "../sections/hero";
import { Navbar } from "../sections/navbar";
import { Newsletter } from "../sections/newsletter";

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Faq />
        <Cta />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
};

export default Home;
