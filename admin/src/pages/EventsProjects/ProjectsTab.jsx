import { useState } from "react";
import styles from "./TabToolbar.module.css";
import { STATUS_OPTIONS } from "./constants.js";
import { useProjects } from "./useProjects.js";
import ProjectCard from "./ProjectCard.jsx";
import Modal from "./Modal.jsx";
import ProjectForm from "./ProjectForm.jsx";

function ProjectsTab() {
  const {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filteredProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [editingProject, setEditingProject] = useState(null);

  const openAdd = () =>
    setEditingProject({});

  const openEdit = (p) =>
    setEditingProject(p);

  const closeForm = () =>
    setEditingProject(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) {
      return;
    }

    await deleteProject(id);
  };

  const handleFormSubmit = async (form) => {
  console.log(
    "PROJECTS TAB FORM:",
    form
  );

  console.log(
    "PROJECTS TAB PHOTOS:",
    form.photos
  );

  console.log(
    "CALLING CREATE PROJECT"
  );

  if (editingProject?._id) {
    await updateProject(
      editingProject._id,
      form
    );
  } else {
    await createProject(form);
  }

  console.log(
    "CREATE PROJECT FINISHED"
  );

  closeForm();
};
  return (
    <div>
      <div className={styles.tabToolbar}>
        <div className={styles.toolbarLeft}>
          <input
            className={styles.search}
            placeholder="Search projects…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option value="All">
              All status
            </option>

            {STATUS_OPTIONS.map((s) => (
              <option key={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          className={styles.addBtn}
          onClick={openAdd}
        >
          + Add project
        </button>
      </div>

      <p className={styles.resultCount}>
        {filteredProjects.length} project
        {filteredProjects.length !== 1
          ? "s"
          : ""}
      </p>

      {loading && (
        <p className={styles.empty}>
          Loading…
        </p>
      )}

      {!loading &&
        filteredProjects.length === 0 && (
          <p className={styles.empty}>
            No projects found.
          </p>
        )}

      <div className={styles.cardGrid}>
        {filteredProjects.map((p) => (
          <ProjectCard
            key={p._id}
            project={p}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingProject && (
        <Modal
          title={
            editingProject._id
              ? "Edit project"
              : "Add project"
          }
          onClose={closeForm}
        >
          <ProjectForm
            initialData={
              editingProject._id
                ? {
                    title:
                      editingProject.title,
                    description:
                      editingProject.description,
                    sdgTag:
                      editingProject.sdgTag,
                    barangay:
                      editingProject.barangay,
                    status:
                      editingProject.status,
                    photos:
                      editingProject.photos ||
                      [],
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

export default ProjectsTab;