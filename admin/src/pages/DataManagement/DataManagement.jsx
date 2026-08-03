import { useState } from "react";
import styles from "./DataManagement.module.css";
import { useProjects } from "./useProjects.js";
import ProjectToolbar from "./ProjectToolbar.jsx";
import ProjectTable from "./ProjectTable.jsx";
import ProjectFormModal from "./ProjectFormModal.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";

function DataManagement() {
  const {
    projects,
    filteredProjects,
    loading,
    error,
    search,
    setSearch,
    filterSDG,
    setFilterSDG,
    filterStatus,
    setFilterStatus,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [editingProject, setEditingProject] = useState(null); // null = closed, {} = add, row = edit
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => setEditingProject({});
  const openEdit = (row) => setEditingProject(row);
  const closeForm = () => setEditingProject(null);

  const handleFormSubmit = async (form) => {
    if (editingProject?._id) {
      await updateProject(editingProject._id, form);
    } else {
      await createProject(form);
    }
    closeForm();
  };

  const handleDelete = async () => {
    await deleteProject(deleteId);
    setDeleteId(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Data Management</h1>
          <p className={styles.pageSubtitle}>{projects.length} total projects</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          + Add project
        </button>
      </div>

      <ProjectToolbar
        search={search}
        onSearch={setSearch}
        filterSDG={filterSDG}
        onFilterSDG={setFilterSDG}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
      />

      <div className={styles.tableWrapper}>
        <ProjectTable
          loading={loading}
          error={error}
          projects={filteredProjects}
          onEdit={openEdit}
          onRequestDelete={setDeleteId}
        />
      </div>

      {editingProject && (
        <ProjectFormModal
          isEdit={Boolean(editingProject._id)}
          initialData={
            editingProject._id
              ? {
                  title: editingProject.title,
                  description: editingProject.description,
                  sdgTag: editingProject.sdgTag,
                  barangay: editingProject.barangay,
                  status: editingProject.status,
                }
              : null
          }
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {deleteId && <ConfirmDeleteModal onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />}
    </div>
  );
}

export default DataManagement;