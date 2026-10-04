import { useState } from "react";

import styles from "./UserManagement.module.css";

import { useUsers } from "./useUsers.js";

import SummaryRow from "./SummaryRow.jsx";
import UserToolbar from "./UserToolbar.jsx";
import UserTable from "./UserTable.jsx";
import Modal from "./Modal.jsx";
import EditUserForm from "./EditUserForm.jsx";
import CreateUserForm from "./CreateUserForm.jsx";

function UserManagement() {
  const {
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    counts,
    updateUser,
    deleteUser,
    createUser,
  } = useUsers();

  const [selected, setSelected] =
    useState(null);

  const [creating, setCreating] =
    useState(false);

  const openEdit = (user) => {
    setSelected(user);
  };

  const closeModal = () => {
    setSelected(null);
  };

  const closeCreate = () => {
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this user? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteUser(id);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleFormSubmit = async (form) => {
    try {
      await updateUser(
        selected._id,
        form
      );

      closeModal();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateSubmit = async (form) => {
    try {
      await createUser(form);
      closeCreate();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            User Management
          </h1>

          <p
            className={
              styles.pageSubtitle
            }
          >
            Manage registered users and
            their roles
          </p>
        </div>

        <button
          type="button"
          className={styles.createBtn}
          onClick={() =>
            setCreating(true)
          }
        >
          + Create Account
        </button>
      </div>

      <SummaryRow
        counts={counts}
        loading={loading}
      />

      <UserToolbar
        search={search}
        onSearch={setSearch}
        roleFilter={roleFilter}
        onRoleFilter={setRoleFilter}
        resultCount={
          filteredUsers.length
        }
      />

      {error && (
        <p className={styles.errorMsg}>
          {error}
        </p>
      )}

      <UserTable
        loading={loading}
        users={filteredUsers}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {selected && (
        <Modal
          title={`Edit — ${selected.fullName}`}
          onClose={closeModal}
        >
          <EditUserForm
            user={selected}
            onClose={closeModal}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}

      {creating && (
        <Modal
          title="Create Account"
          onClose={closeCreate}
        >
          <CreateUserForm
            onClose={closeCreate}
            onSubmit={handleCreateSubmit}
          />
        </Modal>
      )}
    </div>
  );
}

export default UserManagement;