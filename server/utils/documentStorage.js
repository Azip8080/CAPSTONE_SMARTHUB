
const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

const BUCKET_NAME = "sdgSourceDocuments";

function getBucket() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error(
      "MongoDB is not connected. Cannot access document storage."
    );
  }

  return new GridFSBucket(db, {
    bucketName: BUCKET_NAME,
  });
}

function saveDocument(buffer, filename, metadata = {}) {
  if (!Buffer.isBuffer(buffer)) {
    return Promise.reject(
      new Error("A valid file buffer is required.")
    );
  }

  return new Promise((resolve, reject) => {
    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
    });

    uploadStream.once("error", reject);

    uploadStream.once("finish", () => {
      resolve({
        id: uploadStream.id,
        filename,
      });
    });

    uploadStream.end(buffer);
  });
}

function getDocumentDownloadStream(fileId) {
  if (!ObjectId.isValid(fileId)) {
    throw new Error("Invalid document ID.");
  }

  return getBucket().openDownloadStream(
    new ObjectId(fileId)
  );
}

async function deleteStoredDocument(fileId) {
  if (!ObjectId.isValid(fileId)) {
    throw new Error("Invalid document ID.");
  }

  await getBucket().delete(new ObjectId(fileId));
}

module.exports = {
  saveDocument,
  getDocumentDownloadStream,
  deleteStoredDocument,
};
