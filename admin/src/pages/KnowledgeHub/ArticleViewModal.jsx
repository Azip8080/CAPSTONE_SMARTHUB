
import styles from "./ArticleViewModal.module.css";
import { getSdgInfo } from "./constants.js";
import { getFileUrl } from "../../utils/fileUrl";

function ArticleViewModal({ article, onEdit, onDelete }) {
  if (!article) return null;

  const sdg = getSdgInfo(article.sdgTag);

  const photos = Array.isArray(article.photos)
    ? article.photos
    : [];

  const document = article.document || null;

  const documentPath =
    document?.path || document?.url || "";

  const documentUrl = getFileUrl(documentPath);

  const documentName =
    document?.originalName ||
    document?.filename ||
    "Uploaded resource document";

  return (
    <div className={styles.viewBody}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>
          KNOWLEDGE RESOURCE
        </span>

        <h2 className={styles.title}>{article.title}</h2>

        <div className={styles.viewBadges}>
          <span
            className={styles.sdgChip}
            style={{ background: sdg?.color || "#888" }}
          >
            {article.sdgTag}
          </span>

          <span className={styles.catChip}>
            {article.category}
          </span>

          <span className={styles.sdgName}>
            {sdg?.label || article.sdgTag}
          </span>
        </div>
      </div>

      <section className={styles.gallerySection}>
        <div className={styles.sectionHeading}>
          <h3>Resource Photos</h3>
          <span>
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {photos.length > 0 ? (
          <div className={styles.photoGrid}>
            {photos.map((photo, index) => {
              const photoUrl = getFileUrl(photo);

              return (
                <div
                  key={`${photo}-${index}`}
                  className={
                    index === 0
                      ? styles.primaryPhoto
                      : styles.secondaryPhoto
                  }
                >
                  <img
                    src={photoUrl}
                    alt={`${article.title} - photo ${index + 1}`}
                    loading="lazy"
                    onLoad={() => {
                      console.log("Knowledge Hub image loaded:", photoUrl);
                    }}
                    onError={(event) => {
                      console.error("Knowledge Hub image failed:", {
                        storedPath: photo,
                        resolvedUrl: photoUrl,
                        actualUrl: event.currentTarget.currentSrc,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.photoEmpty}>
            No resource photos available.
          </div>
        )}
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <h3>Resource Content</h3>
        </div>

        {article.summary && (
          <p className={styles.viewContent}>{article.summary}</p>
        )}

        <p className={styles.viewContent}>
          {article.content || "No resource content available."}
        </p>
      </section>

      <section className={styles.documentSection}>
        <div className={styles.sectionHeading}>
          <h3>Resource Document</h3>
        </div>

        {documentUrl ? (
          <div className={styles.documentCard}>
            <div className={styles.documentIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8M8 17h8" />
              </svg>
            </div>

            <div className={styles.documentInfo}>
              <h4>{documentName}</h4>
              <p>Uploaded knowledge resource</p>
            </div>

            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewDocumentBtn}
            >
              View Document
            </a>
          </div>
        ) : (
          <div className={styles.documentEmpty}>
            No resource document uploaded.
          </div>
        )}
      </section>

      <section className={styles.infoSection}>
        <div>
          <span className={styles.infoLabel}>SDG</span>
          <span className={styles.infoValue}>{article.sdgTag}</span>
        </div>

        <div>
          <span className={styles.infoLabel}>CATEGORY</span>
          <span className={styles.infoValue}>{article.category}</span>
        </div>

        <div>
          <span className={styles.infoLabel}>SDG GOAL</span>
          <span className={styles.infoValue}>
            {sdg?.label || article.sdgTag}
          </span>
        </div>
      </section>

      <div className={styles.viewActions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => onEdit(article)}
        >
          Edit Resource
        </button>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onDelete(article._id)}
        >
          Delete Resource
        </button>
      </div>
    </div>
  );
}

export default ArticleViewModal;