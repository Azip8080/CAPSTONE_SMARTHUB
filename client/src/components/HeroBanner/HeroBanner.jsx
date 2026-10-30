import styles from "./HeroBanner.module.css";
import backgroundImage from "../../assets/clocktower.png";

function HeroBanner({
  eyebrow,
  title,
  description,
  buttonText,
  onButtonClick,
}) {
  return (
    <section
      className={styles.hero}
      style={{
        backgroundImage: `linear-gradient(rgba(5, 20, 45, 0.58), rgba(5, 20, 45, 0.58)), url(${backgroundImage})`,
      }}
    >
      <div className={styles.content}>
        <span className={styles.eyebrow}>
          {eyebrow}
        </span>

        <h1 className={styles.title}>
          {title}
        </h1>

        <p className={styles.description}>
          {description}
        </p>

        {buttonText && (
          <button
            className={styles.button}
            type="button"
            onClick={onButtonClick}
          >
            {buttonText}
            <span>→</span>
          </button>
        )}

        <a href="#analytics" className={styles.explore}>
          EXPLORE ANALYTICS
          <span>↓</span>
        </a>
      </div>
    </section>
  );
}

export default HeroBanner;