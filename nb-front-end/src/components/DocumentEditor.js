import React, { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MenuBar from "./MenuBar";
import { FaFileAlt } from "react-icons/fa";
import styles from "../styles/DocumentEditor.module.css";
import Account from "./Account";

function DocumentEditor() {
  const { id } = useParams();
  const context = useOutletContext();

  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const ws = useRef(null);
  // TODO: Fetch file name and create a web socket connection
  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found");
          return;
        }
        const response = await fetch(
          `http://localhost:8080/protected/files?id=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error response from server:", errorResponse);
          throw new Error("Network response was not ok");
        }
        
        const data = await response.json();
        setFileName(data.file.FileName);
        // setContent(data.file.Content || "")
        // Establish web socket connection here
      } catch (err) {
        console.error("Error fetching file content:", err);
      }
    };

    fetchFileContent();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    const socket = new WebSocket("ws://localhost:8080/protected/ws");
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      // Send the token as part of the initial message
      socket.send(JSON.stringify({ type: "auth", token }));
    };
    
    socket.onmessage = (event) => {
      console.log("Received message from server:", event.data);
    };
    
    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.current = socket;

    // Cleanup when component unmounts
    return () => {
      socket.close();
    };
  }, []);

  const handleContentChange = (value) => {
    setContent(value);
    localStorage.setItem(`document-${id}`, value);

    // Send the updated content to the server via WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ id, content: value }));
    }
  };

  const handleMenuAction = (action) => {
    if (action === "Save") {
      console.log("Saving document...");
      // You can handle save action here
    } else if (action === "New") {
      setContent("");
      console.log("New document created");
    } else if (action === "Download") {
      console.log("Download document");
      // You can trigger a download action here
    }
  };

  return (
    <div>
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <FaFileAlt className={styles.documentIcon} />
          <h3>{fileName || id}</h3>
        </div>
        <Account className={styles.account} />
      </div>
      <MenuBar onMenuAction={handleMenuAction} className={styles.menubar} />
      <div className={styles.editor}>
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={DocumentEditor.modules}
          formats={DocumentEditor.formats}
        />
      </div>
    </div>
  );
}

// Quill modules configuration
DocumentEditor.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }, { direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image", "code-block"],
    ["clean"],
  ],
};

// Quill formats configuration
DocumentEditor.formats = [
  "header",
  "font",
  "list",
  "bullet",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "script",
  "indent",
  "direction",
  "color",
  "background",
  "align",
  "link",
  "image",
  "code-block",
];

export default DocumentEditor;
