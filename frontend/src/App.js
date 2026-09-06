import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Login from "./Login";

const API = "http://localhost:8080/api";

function App() {
  // ================= LOGIN =================

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("cloudStorageLoggedIn") === "true"
  );

  // ================= STATE =================

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeMenu, setActiveMenu] = useState("My Files");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const fileInputRef = useRef(null);

  // ================= FETCH FOLDERS =================

  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API}/folders`);

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Folder error:", error);
    }
  };

  // ================= FETCH FILES =================

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API}/files`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.log("Files API error:", error);
    }
  };

  // ================= LOAD DATA AFTER LOGIN =================

  useEffect(() => {
    if (loggedIn) {
      fetchFolders();
      fetchFiles();
    }
  }, [loggedIn]);

  // ================= CREATE FOLDER =================

  const createFolder = async () => {
    if (!folderName.trim()) {
      alert("Please enter a folder name.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/folders?folderName=${encodeURIComponent(folderName)}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Could not create folder");
      }

      setFolderName("");
      await fetchFolders();

      alert("Folder created successfully!");
    } catch (error) {
      console.error(error);
      alert("Could not create folder.");
    }
  };

  // ================= UPLOAD =================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API}/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("Upload failed");
      }

      const uploadedFile = await response.json();

      setFiles((previous) => [uploadedFile, ...previous]);

      alert("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Could not upload file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ================= FOLDER =================

  const openFolder = (folder) => {
    setSelectedFolder(folder);
  };

  const closeFolder = () => {
    setSelectedFolder(null);
  };

  // ================= SEARCH =================

  const filteredFolders = folders.filter((folder) =>
    folder.folderName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredFiles = files.filter((file) =>
    file.fileName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= FILE ICON =================

  const getFileIcon = (fileName) => {
    if (!fileName) {
      return "📄";
    }

    const extension = fileName
      .split(".")
      .pop()
      .toLowerCase();

    if (extension === "pdf") return "📕";

    if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
    ) {
      return "🖼️";
    }

    if (
      ["mp4", "mov", "avi", "mkv"].includes(extension)
    ) {
      return "🎬";
    }

    if (
      ["doc", "docx"].includes(extension)
    ) {
      return "📘";
    }

    if (
      ["xls", "xlsx", "csv"].includes(extension)
    ) {
      return "📊";
    }

    if (
      ["zip", "rar", "7z"].includes(extension)
    ) {
      return "🗜️";
    }

    return "📄";
  };

  // ================= FORMAT SIZE =================

  const formatSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ================= LOGIN PAGE =================

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem(
            "cloudStorageLoggedIn",
            "true"
          );

          setLoggedIn(true);
        }}
      />
    );
  }

  // ================= DASHBOARD =================

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            ☁
          </div>

          <div>
            <h2>CloudStorage</h2>
            <p>Secure file management</p>
          </div>

        </div>

        <button
          className="upload-btn"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <span>
            {uploading ? "⏳" : "＋"}
          </span>

          {uploading
            ? "Uploading..."
            : "Upload File"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <div className="nav-title">
          WORKSPACE
        </div>

        <nav className="navigation">

          <button
            className={`menu ${
              activeMenu === "My Files"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveMenu("My Files");
              setSelectedFolder(null);
            }}
          >
            <span className="menu-icon">
              📁
            </span>

            <span>
              My Files
            </span>
          </button>

          <button
            className={`menu ${
              activeMenu === "Starred"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveMenu("Starred");
              setSelectedFolder(null);
            }}
          >
            <span className="menu-icon">
              ⭐
            </span>

            <span>
              Starred
            </span>
          </button>

          <button
            className={`menu ${
              activeMenu === "Trash"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveMenu("Trash");
              setSelectedFolder(null);
            }}
          >
            <span className="menu-icon">
              🗑️
            </span>

            <span>
              Trash
            </span>
          </button>

        </nav>

        <div className="sidebar-spacer"></div>

        <div className="storage-card">

          <div className="storage-title">
            <span>
              Storage
            </span>

            <strong>
              12%
            </strong>
          </div>

          <div className="storage-bar">
            <div className="storage-progress"></div>
          </div>

          <p>
            1.2 GB of 10 GB used
          </p>

        </div>

        <div className="sidebar-footer">
          <span>☁</span>
          CloudStorage
        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* ================= TOP BAR ================= */}

        <header className="topbar">

          <div className="breadcrumb">

            <span>
              CloudStorage
            </span>

            <span className="breadcrumb-arrow">
              ›
            </span>

            <strong>
              {selectedFolder
                ? selectedFolder.folderName
                : activeMenu}
            </strong>

          </div>

          <div className="top-actions">

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search files and folders..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <button
              className="notification-btn"
              title="Notifications"
            >
              🔔
            </button>

            <div className="profile">

              <div className="avatar">
                A
              </div>

              <div className="profile-info">
                <strong>
                  Admin
                </strong>

                <span>
                  My Account
                </span>
              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <div className="content">

          {/* ================= FOLDER PAGE ================= */}

          {selectedFolder ? (

            <>

              <button
                className="back-btn"
                onClick={closeFolder}
              >
                ← Back to My Files
              </button>

              <div className="page-heading">

                <div className="heading-left">

                  <div className="large-folder-icon">
                    📁
                  </div>

                  <div>

                    <h1>
                      {selectedFolder.folderName}
                    </h1>

                    <p>
                      Files inside this folder
                    </p>

                  </div>

                </div>

                <button
                  className="primary-btn"
                  onClick={handleUploadClick}
                >
                  ＋ Upload File
                </button>

              </div>

              <div className="empty-folder">

                <div className="empty-folder-icon">
                  📂
                </div>

                <h2>
                  This folder is empty
                </h2>

                <p>
                  Upload files to this folder
                  to get started.
                </p>

                <button
                  className="primary-btn"
                  onClick={handleUploadClick}
                >
                  ＋ Upload File
                </button>

              </div>

            </>

          ) : (

            <>

              {/* ================= PAGE HEADER ================= */}

              <div className="page-heading">

                <div>

                  <div className="eyebrow">
                    CLOUD STORAGE
                  </div>

                  <h1>
                    {activeMenu === "My Files"
                      ? "My Files"
                      : activeMenu}
                  </h1>

                  <p>
                    {activeMenu === "My Files"
                      ? "Manage your files and folders in one place."
                      : `View your ${activeMenu.toLowerCase()} files.`}
                  </p>

                </div>

                <button
                  className="primary-btn"
                  onClick={handleUploadClick}
                >
                  ＋ Upload File
                </button>

              </div>

              {/* ================= MY FILES ================= */}

              {activeMenu === "My Files" && (

                <>

                  {/* CREATE FOLDER */}

                  <section className="create-folder-card">

                    <div className="create-folder-info">

                      <div className="create-icon">
                        📁
                      </div>

                      <div>

                        <h2>
                          Create New Folder
                        </h2>

                        <p>
                          Organize your files into folders
                        </p>

                      </div>

                    </div>

                    <div className="folder-form">

                      <input
                        type="text"
                        placeholder="Enter folder name"
                        value={folderName}
                        onChange={(e) =>
                          setFolderName(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            createFolder();
                          }
                        }}
                      />

                      <button
                        onClick={createFolder}
                      >
                        Create Folder
                      </button>

                    </div>

                  </section>

                  {/* ================= FOLDERS ================= */}

                  <section className="section">

                    <div className="section-heading">

                      <div>

                        <h2>
                          Folders
                        </h2>

                        <span>
                          {filteredFolders.length}{" "}
                          {filteredFolders.length === 1
                            ? "folder"
                            : "folders"}
                        </span>

                      </div>

                    </div>

                    {filteredFolders.length === 0 ? (

                      <div className="small-empty">

                        <div>
                          📁
                        </div>

                        <h3>
                          No folders found
                        </h3>

                        <p>
                          Create a new folder to organize your files.
                        </p>

                      </div>

                    ) : (

                      <div className="folders-grid">

                        {filteredFolders.map((folder) => (

                          <div
                            className="folder-card"
                            key={folder.id}
                            onClick={() =>
                              openFolder(folder)
                            }
                          >

                            <div className="folder-card-top">

                              <div className="folder-icon">
                                📁
                              </div>

                              <button
                                className="more-btn"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                ⋮
                              </button>

                            </div>

                            <h3>
                              {folder.folderName}
                            </h3>

                            <p>
                              Folder
                            </p>

                          </div>

                        ))}

                      </div>

                    )}

                  </section>

                  {/* ================= FILES ================= */}

                  <section className="section">

                    <div className="section-heading">

                      <div>

                        <h2>
                          Files
                        </h2>

                        <span>
                          {filteredFiles.length}{" "}
                          {filteredFiles.length === 1
                            ? "file"
                            : "files"}
                        </span>

                      </div>

                    </div>

                    {filteredFiles.length === 0 ? (

                      <div className="small-empty">

                        <div>
                          📄
                        </div>

                        <h3>
                          No files yet
                        </h3>

                        <p>
                          Upload a file to see it here.
                        </p>

                        <button
                          className="small-upload-btn"
                          onClick={handleUploadClick}
                        >
                          ＋ Upload File
                        </button>

                      </div>

                    ) : (

                      <div className="files-grid">

                        {filteredFiles.map((file) => (

                          <div
                            className="file-card"
                            key={file.id}
                          >

                            <div className="file-card-header">

                              <div className="file-icon">
                                {getFileIcon(
                                  file.fileName
                                )}
                              </div>

                              <button className="more-btn">
                                ⋮
                              </button>

                            </div>

                            <div className="file-info">

                              <h3
                                title={file.fileName}
                              >
                                {file.fileName}
                              </h3>

                              <p>
                                {file.fileType || "File"}
                              </p>

                              <span>
                                {formatSize(
                                  file.fileSize
                                )}
                              </span>

                            </div>

                            {file.fileUrl && (

                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="open-file"
                              >
                                Open File →
                              </a>

                            )}

                          </div>

                        ))}

                      </div>

                    )}

                  </section>

                </>

              )}

              {/* ================= STARRED ================= */}

              {activeMenu === "Starred" && (

                <div className="coming-soon">

                  <div className="coming-icon">
                    ⭐
                  </div>

                  <h2>
                    Starred Files
                  </h2>

                  <p>
                    Your starred files will appear here.
                  </p>

                </div>

              )}

              {/* ================= TRASH ================= */}

              {activeMenu === "Trash" && (

                <div className="coming-soon">

                  <div className="coming-icon">
                    🗑️
                  </div>

                  <h2>
                    Trash
                  </h2>

                  <p>
                    Deleted files will appear here.
                  </p>

                </div>

              )}

            </>

          )}

        </div>

      </main>

    </div>
  );
}

export default App;