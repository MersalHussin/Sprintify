import { Cta } from "../sections/cta";
import { Faq } from "../sections/faq";
import { Features } from "../sections/features";
import { Footer } from "../sections/footer";
import { Hero } from "../sections/hero";
import { Navbar } from "../sections/navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
};

export default Home;
