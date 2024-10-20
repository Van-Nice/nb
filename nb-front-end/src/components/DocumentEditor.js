import React, { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MenuBar from "./MenuBar";
import { FaFileAlt } from "react-icons/fa";
import styles from "../styles/DocumentEditor.module.css";
import Account from "./Account";
import FileNameModal from './FileNameModal';

function DocumentEditor() {
  // const navigate = useNavigate();
  const { id } = useParams();
  const context = useOutletContext();

  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const quillRef = useRef(null); // Quill editor reference
  const ws = useRef(null);
  const fileNameModalRef = useRef(null);

  // Fetch file content and establish WebSocket connection
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
        setContent(data.file.Content || "");
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
  
    const socket = new WebSocket(`ws://localhost:8080/protected/ws?token=${token}`);
  
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "ok") {
        console.log("Acknowledgment received");
      } else {
        setContent(data.content);
      }
    };
  
    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };
  
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  
    ws.current = socket;
  
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
    if (action === "New") {
      if (fileNameModalRef.current) {
        fileNameModalRef.current.openModal();
      }
    } else if (action === "Download") {
      console.log("Download document");
      // Implement download logic here
    } else if (action === "Cut") {
      handleCut();
    } else if (action === "Copy") {
      handleCopy();
    } else if (action === "Paste") {
      handlePaste();
    } else if (action === "Undo") {
      handleUndo();
    } else if (action === "Redo") {
      handleRedo();
    }
  };

  // Clipboard actions for Quill editor
  const handleUndo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.history.undo();
      quill.focus();
      console.log("Undo action performed");
    } else {
      console.error("Quill editor instance is not available");
    }
  };
  
  const handleRedo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.history.redo();
      quill.focus();
      console.log("Redo action performed");
    } else {
      console.error("Quill editor instance is not available");
    }
  };

  const handleCut = () => {
    console.log("Cut operation initiated");
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.focus(); // Ensure the editor is focused
      const range = quill.getSelection();
      console.log('Selection range:', range);
      if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length);
        console.log('Text to cut:', text);
        navigator.clipboard.writeText(text).then(() => {
          quill.deleteText(range.index, range.length);
          console.log("Text cut to clipboard");
        }).catch(err => {
          console.error("Failed to write to clipboard:", err);
        });
      } else {
        console.log("No text selected to cut");
      }
    } else {
      console.error('Quill editor instance is not available');
    }
  };
  
  
  const handleCopy = () => {
    console.log("Copy operation initiated");
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.focus();
      const range = quill.getSelection();
      console.log('Selection range:', range);
      if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length);
        console.log('Text to copy:', text);
        navigator.clipboard.writeText(text).then(() => {
          console.log("Text copied to clipboard");
        }).catch(err => {
          console.error("Failed to write to clipboard:", err);
        });
      } else {
        console.log("No text selected to copy");
      }
    } else {
      console.error('Quill editor instance is not available');
    }
  };
  
  
  const handlePaste = () => {
    console.log("Paste operation initiated");
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.focus();
      navigator.clipboard.readText().then((text) => {
        const range = quill.getSelection(true); // 'true' to get the cursor position if no selection
        console.log('Cursor position for paste:', range);
        if (range) {
          quill.insertText(range.index, text);
          console.log("Text pasted from clipboard");
        }
      }).catch(err => {
        console.error("Failed to read from clipboard:", err);
      });
    } else {
      console.error('Quill editor instance is not available');
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
          ref={quillRef}
          value={content}
          onChange={handleContentChange}
          modules={DocumentEditor.modules}
          formats={DocumentEditor.formats}
        />
      </div>
      <FileNameModal ref={fileNameModalRef} />
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
  history: {
    delay: 1000,
    maxStack: 500,
    userOnly: true,
  },
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
