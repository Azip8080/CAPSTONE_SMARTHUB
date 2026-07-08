import styles from "./About.module.css";
import Hero from "./components/Hero";
import Mission from "./components/Mission";
import SDGSection from "./components/SDGSection";
import Team from "./components/Team";
import TechStack from "./components/TechStack";

function About() {
  return (
    <main className={styles.page}>
      <Hero />
      <Mission />
      <SDGSection />
      <Team />
      <TechStack />
    </main>
  );
}

export default About;