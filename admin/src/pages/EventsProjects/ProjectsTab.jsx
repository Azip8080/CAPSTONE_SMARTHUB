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

  const [editingProject, setEditingProject] =
    useState(null);

  const openAdd = () => {
    setEditingProject({});
  };

  const openEdit = (project) => {
    setEditingProject(project);
  };

  const closeForm = () => {
    setEditingProject(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) {
      return;
    }

    await deleteProject(id);
  };

  const handleFormSubmit = async (form) => {
    if (editingProject?._id) {
      await updateProject(
        editingProject._id,
        form
      );
    } else {
      await createProject(form);
    }

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

            {STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
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
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
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