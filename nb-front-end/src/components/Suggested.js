import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";

export default function Suggested() {
  const { userID } = useContext(UserContext);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const handleGetFiles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("http://localhost:8080/protected/get-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify({
          userID: userID,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setFiles(data); // Assuming the response has a "files" field
      console.log(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    handleGetFiles();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Suggested Files</h1>
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file._id}>{file.file_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}