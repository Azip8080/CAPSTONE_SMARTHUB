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
    filteredArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  } = useArticles();

  const [selected, setSelected] = useState(null); // article being viewed
  const [editingArticle, setEditingArticle] = useState(null); // null = closed, {} = add, row = edit

  const openAdd = () => setEditingArticle({});
  const openEdit = (a) => {
    setEditingArticle(a);
    setSelected(null);
  };
  const closeForm = () => setEditingArticle(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await deleteArticle(id);
      setSelected(null);
    } catch (e) {
      alert(e.message);
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
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Knowledge Hub</h1>
          <p className={styles.pageSubtitle}>Manage educational content and guides about the 17 SDGs</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          + Add article
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

      <ArticleGrid
        loading={loading}
        articles={filteredArticles}
        onView={setSelected}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <ArticleViewModal article={selected} onEdit={openEdit} onDelete={handleDelete} />
        </Modal>
      )}

      {editingArticle && (
        <Modal title={editingArticle._id ? "Edit article" : "Add article"} onClose={closeForm}>
          <ArticleForm
            initialData={
              editingArticle._id
                ? {
                    title: editingArticle.title,
                    content: editingArticle.content,
                    sdgTag: editingArticle.sdgTag,
                    category: editingArticle.category,
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