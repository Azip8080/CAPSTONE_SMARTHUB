import styles from "./ArticleViewModal.module.css";
import { getSdgInfo } from "./constants.js";

function ArticleViewModal({
  article,
  onEdit,
  onDelete,
}) {
  const sdg = getSdgInfo(
    article.sdgTag
  );

  const photos =
    Array.isArray(article.photos)
      ? article.photos
      : [];

  return (
    <div className={styles.viewBody}>
      <div className={styles.header}>
        <span
          className={styles.headerLabel}
        >
          KNOWLEDGE RESOURCE
        </span>

        <h2 className={styles.title}>
          {article.title}
        </h2>

        <div
          className={styles.viewBadges}
        >
          <span
            className={styles.sdgChip}
            style={{
              background:
                sdg.color || "#888",
            }}
          >
            {article.sdgTag}
          </span>

          <span
            className={styles.catChip}
          >
            {article.category}
          </span>

          <span
            className={styles.sdgName}
          >
            {sdg.label}
          </span>
        </div>
      </div>

      {photos.length > 0 ? (
        <section
          className={styles.gallerySection}
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <h3>Resource Photos</h3>

            <span>
              {photos.length} photo
              {photos.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <div
            className={styles.photoGrid}
          >
            {photos.map(
              (photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className={
                    index === 0
                      ? styles.primaryPhoto
                      : styles.secondaryPhoto
                  }
                >
                  <img
                    src={`http://localhost:5000${photo}`}
                    alt={`${article.title} ${
                      index + 1
                    }`}
                  />
                </div>
              )
            )}
          </div>
        </section>
      ) : (
        <div
          className={styles.photoEmpty}
        >
          No resource photos available.
        </div>
      )}

      <section
        className={styles.contentSection}
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <h3>Resource Content</h3>
        </div>

        <p
          className={styles.viewContent}
        >
          {article.content ||
            "No resource content available."}
        </p>
      </section>

      <section
        className={styles.infoSection}
      >
        <div>
          <span
            className={styles.infoLabel}
          >
            SDG
          </span>

          <span
            className={styles.infoValue}
          >
            {article.sdgTag}
          </span>
        </div>

        <div>
          <span
            className={styles.infoLabel}
          >
            CATEGORY
          </span>

          <span
            className={styles.infoValue}
          >
            {article.category}
          </span>
        </div>

        <div>
          <span
            className={styles.infoLabel}
          >
            SDG GOAL
          </span>

          <span
            className={styles.infoValue}
          >
            {sdg.label}
          </span>
        </div>
      </section>

      <div className={styles.viewActions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() =>
            onEdit(article)
          }
        >
          Edit Resource
        </button>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() =>
            onDelete(article._id)
          }
        >
          Delete Resource
        </button>
      </div>
    </div>
  );
}

export default ArticleViewModal;