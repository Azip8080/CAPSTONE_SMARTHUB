
import { useState } from "react";
import styles from "./KnowledgeHub.module.css";
import { useArticles } from "./useArticles.js";
import KnowledgeToolbar from "./KnowledgeToolbar.jsx";
import ArticleGrid from "./ArticleGrid.jsx";
import Modal from "./Modal.jsx";
import ArticleViewModal from "./ArticleViewModal.jsx";
import ArticleForm from "./ArticleForm.jsx";

function KnowledgeHub() {
  const {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    catFilter,
    setCatFilter,
    dateFilter,
    setDateFilter,
    filteredArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  } = useArticles();

  const [selected, setSelected] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  const openAdd = () => {
    setEditingArticle({});
    setSelected(null);
  };

  const openEdit = (article) => {
    setEditingArticle(article);
    setSelected(null);
  };

  const closeForm = () => {
    setEditingArticle(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) {
      return;
    }

    try {
      await deleteArticle(id);
      setSelected(null);
      setEditingArticle(null);
    } catch (error) {
      window.alert(
        error.message || "Failed to delete article."
      );
    }
  };

  const handleFormSubmit = async (form) => {
    try {
      if (editingArticle?._id) {
        await updateArticle(editingArticle._id, form);
      } else {
        await createArticle(form);
      }

      closeForm();
    } catch (error) {
      window.alert(
        error.message || "Failed to save article."
      );
      throw error;
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            Knowledge Hub
          </h1>

          <p className={styles.pageSubtitle}>
            Manage educational content and guides about the 17 SDGs
          </p>
        </div>

        <button
          type="button"
          className={styles.addBtn}
          onClick={openAdd}
        >
          + Add Resource
        </button>
      </div>

      <KnowledgeToolbar
        search={search}
        onSearch={setSearch}
        sdgFilter={sdgFilter}
        onSdgFilter={setSdgFilter}
        catFilter={catFilter}
        onCatFilter={setCatFilter}
        resultCount={filteredArticles.length}
      />

      <div className={styles.dateFilter}>
        <label htmlFor="article-date-filter">
          Upload date:
        </label>

        <select
          id="article-date-filter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="quarterly">This Quarter</option>
        </select>
      </div>

      <ArticleGrid
        loading={loading}
        articles={filteredArticles}
        onView={setSelected}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {selected && (
        <Modal
          title={selected.title}
          onClose={() => setSelected(null)}
        >
          <ArticleViewModal
            article={selected}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </Modal>
      )}

      {editingArticle && (
        <Modal
          title={
            editingArticle._id
              ? "Edit article"
              : "Add article"
          }
          onClose={closeForm}
        >
          <ArticleForm
            key={editingArticle._id || "new-article"}
            initialData={
              editingArticle._id
                ? {
                    ...editingArticle,
                    photos: editingArticle.photos || [],
                    document: editingArticle.document || null,
                  }
                : null
            }
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}
    </div>
  );
}

export default KnowledgeHub;