
import { useState } from "react";
import styles from "./ProjectShowcase.module.css";

import { useShowcaseProjects } from "./useShowcaseProjects.js";
import { useProjects } from "../DataManagement/useProjects.js";

import ViewToggle from "./ViewToggle.jsx";
import ShowcaseToolbar from "./ShowcaseToolbar.jsx";
import ProjectGrid from "./ProjectGrid.jsx";
import ProjectDetailModal from "./ProjectDetailModal.jsx";
import ProjectFormModal from "../DataManagement/ProjectFormModal.jsx";

function ProjectShowcase() {
  const {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    statusFilter,
    setStatusFilter,
    view,
    setView,
    filteredProjects,
    featuredCount,
    toggleFeatured,
    updateProject,
    dateFilter,
    setDateFilter,
    reloadProjects,
  } = useShowcaseProjects();

  const { createProject } = useProjects();

  const [selected, setSelected] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFeatureToggle = async (project) => {
    try {
      await toggleFeatured(project);
      setSelected(null);
    } catch (error) {
      console.error("Failed to update featured status:", error);
      alert(error.message || "Failed to update featured status.");
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateProject(id, form);
      setSelected(null);
    } catch (error) {
      console.error("Failed to update project:", error);
      alert(error.message || "Failed to update project.");
    }
  };

  const handleAddProject = async (form) => {
    if (saving) return;

    setSaving(true);

    try {
      await createProject(form);
      await reloadProjects();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert(error.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Project Showcase</h1>

          <p className={styles.pageSubtitle}>
            Highlight outstanding SDG projects from Manila&apos;s
            barangays
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            <span className={styles.addIcon}>+</span>
            Add Project
          </button>

          <ViewToggle
            view={view}
            onChange={setView}
            featuredCount={featuredCount}
          />
        </div>
      </div>

      <ShowcaseToolbar
        search={search}
        onSearch={setSearch}
        sdgFilter={sdgFilter}
        onSdgFilter={setSdgFilter}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilter={setDateFilter}
        resultCount={filteredProjects.length}
      />

      <ProjectGrid
        loading={loading}
        projects={filteredProjects}
        onView={setSelected}
        onFeatureToggle={handleFeatureToggle}
      />

      <ProjectDetailModal
        project={selected}
        onClose={() => setSelected(null)}
        onFeatureToggle={handleFeatureToggle}
        onUpdate={handleUpdate}
      />

      {showAddForm && (
        <ProjectFormModal
          isEdit={false}
          initialData={null}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddProject}
        />
      )}
    </div>
  );
}

export default ProjectShowcase;
