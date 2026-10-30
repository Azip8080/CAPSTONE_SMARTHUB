
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
  const documentPath = document?.path || document?.url || "";
  const documentUrl = getFileUrl(documentPath);

  const documentName =
    document?.originalName ||
    document?.filename ||
    "Uploaded resource document";

  const resourceType = article.resourceType || "uploaded";

  const isVideo =
    resourceType === "youtube" || resourceType === "shorts";

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

      {isVideo && article.embedUrl && (
        <section className={styles.contentSection}>
          <div className={styles.sectionHeading}>
            <h3>
              {resourceType === "shorts"
                ? "YouTube Shorts"
                : "YouTube Video"}
            </h3>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: resourceType === "shorts" ? "360px" : "720px",
              aspectRatio: resourceType === "shorts" ? "9 / 16" : "16 / 9",
              margin: "0 auto",
            }}
          >
            <iframe
              src={article.embedUrl}
              title={article.title}
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: "12px",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {resourceType === "article" && article.sourceUrl && (
        <section className={styles.contentSection}>
          <div className={styles.sectionHeading}>
            <h3>External Article</h3>
          </div>

          {article.thumbnailUrl && (
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "15px",
              }}
            />
          )}

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "11px 18px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Read Full Article
          </a>
        </section>
      )}

      {photos.length > 0 && (
        <section className={styles.gallerySection}>
          <div className={styles.sectionHeading}>
            <h3>Resource Photos</h3>
            <span>
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </span>
          </div>

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
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <h3>Resource Content</h3>
        </div>

        {article.summary && (
          <p className={styles.viewContent}>{article.summary}</p>
        )}

        {article.content && (
          <p className={styles.viewContent}>{article.content}</p>
        )}

        {!article.summary && !article.content && (
          <p className={styles.viewContent}>
            No additional content available.
          </p>
        )}
      </section>

      {documentUrl && (
        <section className={styles.documentSection}>
          <div className={styles.sectionHeading}>
            <h3>Resource Document</h3>
          </div>

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
        </section>
      )}

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
          <span className={styles.infoLabel}>RESOURCE TYPE</span>
          <span className={styles.infoValue}>{resourceType}</span>
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
