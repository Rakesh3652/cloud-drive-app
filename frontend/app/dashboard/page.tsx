"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string>("Root");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async (folderId: string | null = null) => {
    if (!token) {
      router.push("/login");
      return;
    }

    const folderEndpoint = folderId
      ? `/folders/${folderId}`
      : "/folders/root";

    const fileEndpoint = folderId
      ? `/files/${folderId}`
      : "/files/root";

    const folderData = await apiRequest(
      folderEndpoint,
      "GET",
      undefined,
      token
    );

    const fileData = await apiRequest(
      fileEndpoint,
      "GET",
      undefined,
      token
    );

    setFolders(folderData);
    setFiles(fileData);
  };

  useEffect(() => {
    fetchData(currentFolderId);
  }, [currentFolderId]);

  const enterFolder = (folder: any) => {
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name);
  };

  const goBack = () => {
    setCurrentFolderId(null);
    setCurrentFolderName("Root");
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    await apiRequest(
      "/folders",
      "POST",
      {
        name: newFolderName,
        parentId: currentFolderId,
      },
      token!
    );

    setNewFolderName("");
    fetchData(currentFolderId);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    if (currentFolderId) {
      formData.append("folderId", currentFolderId);
    }

    const res = await fetch(
      "http://localhost:5000/api/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    setSelectedFile(null);
    fetchData(currentFolderId);
  };

  const handleDownload = async (fileId: string) => {
    const res = await fetch(
      `http://localhost:5000/api/files/download/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Download failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDelete = async (fileId: string) => {
    await apiRequest(`/files/${fileId}`, "DELETE", undefined, token!);
    fetchData(currentFolderId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-wide">
          🚀 Cloud Drive
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="p-10">

        {/* Folder Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">
            📂 {currentFolderName}
          </h2>

          {currentFolderId && (
            <button
              onClick={goBack}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
            >
              ⬅ Back
            </button>
          )}
        </div>

        {/* ACTION BAR */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10 flex flex-wrap gap-4 items-center">

          <input
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none"
            placeholder="New Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />

          <button
            onClick={handleCreateFolder}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Create Folder
          </button>

          <input
            type="file"
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600"
            onChange={(e) =>
              setSelectedFile(
                e.target.files ? e.target.files[0] : null
              )
            }
          />

          <button
            onClick={handleUpload}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
          >
            Upload
          </button>

        </div>

        {/* FOLDERS */}
        <h3 className="text-xl font-semibold mb-4 text-gray-300">
          Folders
        </h3>

        <div className="grid grid-cols-4 gap-6 mb-12">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => enterFolder(folder)}
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl shadow-md cursor-pointer transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📁</div>
              <div className="font-medium truncate">
                {folder.name}
              </div>
            </div>
          ))}
        </div>

        {/* FILES */}
        <h3 className="text-xl font-semibold mb-4 text-gray-300">
          Files
        </h3>

        <div className="grid grid-cols-4 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-between hover:bg-gray-700 transition"
            >
              <div
                onClick={() => handleDownload(file.id)}
                className="cursor-pointer"
              >
                <div className="text-3xl mb-2">📄</div>
                <div className="truncate font-medium">
                  {file.name}
                </div>
              </div>

              <button
                onClick={() => handleDelete(file.id)}
                className="mt-4 text-sm text-red-400 hover:text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
