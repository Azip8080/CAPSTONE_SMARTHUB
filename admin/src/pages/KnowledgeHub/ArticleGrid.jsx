import styles from "./ArticleGrid.module.css";
import ArticleCard from "./ArticleCard.jsx";

function ArticleGrid({ loading, articles, onView, onEdit, onDelete }) {
  if (loading) return <p className={styles.empty}>Loading…</p>;
  if (articles.length === 0) return <p className={styles.empty}>No articles found.</p>;

  return (
    <div className={styles.grid}>
      {articles.map((a) => (
        <ArticleCard key={a._id} article={a} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ArticleGrid;