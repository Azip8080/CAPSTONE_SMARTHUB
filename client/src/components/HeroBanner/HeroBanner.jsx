import styles from "./HeroBanner.module.css";

function HeroBanner({
  eyebrow,
  title,
  description,
  buttonText,
  image,
  onButtonClick,
}) {
  return (
    <section className={styles.hero}>
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

      <div className={styles.visual}>
        {image && (
          <img
            src={image}
            alt=""
            className={styles.image}
          />
        )}
      </div>
    </section>
  );
}

export default HeroBanner;