
import styles from "./HeroBanner.module.css";
import backgroundImage from "../../assets/BG.png";

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
        backgroundImage: `linear-gradient(rgba(5, 20, 45, 0.65), rgba(5, 20, 45, 0.65)), url("${backgroundImage}")`,
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
      </div>
    </section>
  );
}

export default HeroBanner;