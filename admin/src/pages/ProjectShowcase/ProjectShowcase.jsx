import { useState } from "react";
import styles from "./ProjectShowcase.module.css";
import { useShowcaseProjects } from "./useShowcaseProjects.js";
import ViewToggle from "./ViewToggle.jsx";
import ShowcaseToolbar from "./ShowcaseToolbar.jsx";
import ProjectGrid from "./ProjectGrid.jsx";
import ProjectDetailModal from "./ProjectDetailModal.jsx";

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
  } = useShowcaseProjects();

  const [selected, setSelected] =
    useState(null);

  const handleFeatureToggle =
    async (project) => {
      try {
        await toggleFeatured(project);
        setSelected(null);
      } catch (e) {
        alert(e.message);
      }
    };

  const handleUpdate = async (
    id,
    form
  ) => {
    try {
      await updateProject(id, form);
      setSelected(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            Project Showcase
          </h1>

          <p
            className={
              styles.pageSubtitle
            }
          >
            Highlight outstanding SDG
            projects from Manila's
            barangays
          </p>
        </div>

        <ViewToggle
          view={view}
          onChange={setView}
          featuredCount={featuredCount}
        />
      </div>

      <ShowcaseToolbar
        search={search}
        onSearch={setSearch}
        sdgFilter={sdgFilter}
        onSdgFilter={setSdgFilter}
        statusFilter={statusFilter}
        onStatusFilter={
          setStatusFilter
        }
        resultCount={
          filteredProjects.length
        }
      />

      <ProjectGrid
        loading={loading}
        projects={filteredProjects}
        onView={setSelected}
        onFeatureToggle={
          handleFeatureToggle
        }
      />

      <ProjectDetailModal
        project={selected}
        onClose={() =>
          setSelected(null)
        }
        onFeatureToggle={
          handleFeatureToggle
        }
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default ProjectShowcase;