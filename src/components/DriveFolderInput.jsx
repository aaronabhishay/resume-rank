import React, { useState, useEffect } from "react";
import { FolderGit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function DriveFolderInput({ value, onChange }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://resume-rank.onrender.com'}/api/drive-folders`);
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
        const data = await response.json();
        setFolders(data);
      } catch (err) {
        setError('Failed to load folders');
        console.error('Error fetching folders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    setSelectedFolderId(value);
  }, [value]);

  const handleFolderChange = (folderId) => {
    setSelectedFolderId(folderId);
    onChange(folderId);
  };

  const getSelectedFolderName = () => {
    const selectedFolder = folders.find(folder => folder.id === selectedFolderId);
    return selectedFolder ? selectedFolder.name : "Select a folder...";
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <select
            className="w-full border rounded-md p-2 pl-9"
            value={selectedFolderId}
            onChange={e => {
              setSelectedFolderId(e.target.value);
              onChange(e.target.value);
            }}
          >
            <option value="">Select a folder...</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        Make sure the folder is shared with the service account email
      </p>
    </div>
  );
} 