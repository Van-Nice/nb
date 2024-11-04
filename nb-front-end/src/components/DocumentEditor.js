import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useOutletContext, useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MenuBar from "./MenuBar";
import Modal from './Modal';
import MoveFileModal from "./MoveFileModal";
import FileBrowser from './FileBrowser';
import { FaFileAlt } from "react-icons/fa";
import styles from "../styles/DocumentEditor.module.css";
import Account from "./Account";
import FileNameModal from './FileNameModal';
import TurndownService from 'turndown';
import RenameFileModal from './RenameFileModal'; 
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import { config } from '../config/config';

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const quillRef = useRef(null);
  const ws = useRef(null);
  const fileNameModalRef = useRef(null);
  const renameFileModalRef = useRef(null);
  const moveFileModalRef = useRef(null);

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
          `${config.apiUrl}/protected/files?id=${id}`,
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
  
    const socket = new WebSocket(`${config.wsUrl}/protected/ws?token=${token}`);
  
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

  // Download actions for Download selection from menu bar
  const downloadAsText = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const text = quill.getText();
      const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
      const fileNameWithExtension = `${fileName || 'document'}.txt`;
      triggerDownload(blob, fileNameWithExtension)
    }
  };

  const downloadAsHTML = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const html = quill.root.innerHTML;
      const blob = new Blob([html], {type: 'text/html;charset=utf-8'});
      const fileNameWithExtension = `${fileName || 'document'}.html`;
      triggerDownload(blob, fileNameWithExtension);
    }
  };

  const downloadAsMarkdown = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const html = quill.root.innerHTML;
      const turndownService = new TurndownService();
      const markdown = turndownService.turndown(html);
      const blob = new Blob([markdown], {type: 'text/markdown;charset=utf-8'});
      const fileNameWithExtension = `${fileName || 'document'}.md`;
      triggerDownload(blob, fileNameWithExtension);
    }
  }

  const downloadAsPDF = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const html = quill.root.innerHTML;
      const fileNameWithExtension = `${fileName || 'document'}.pdf`;
      const options = {
        margin: 1,
        filename: fileNameWithExtension,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      html2pdf().from(html).set(options).save();
    }
  };

  const downloadAsDocx = async () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const text = quill.getText();
      const doc = new Document({
        sections: [
          {
            children: [new Paragraph(text)],
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const fileNameWithExtension = `${fileName || 'document'}.docx`;
      saveAs(blob, fileNameWithExtension);
    }
  };

  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMenuAction = (action) => {
    if (action === "New") {
      if (fileNameModalRef.current) {
        fileNameModalRef.current.openModal();
      }
    } else if (action === "DownloadTXT") {
      downloadAsText();
    } else if (action === "DownloadHTML") {
      downloadAsHTML();
    } else if (action === "DownloadMD") {
      downloadAsMarkdown();
    } else if (action === "DownloadPDF") {
      downloadAsPDF();
    } else if (action === "DownloadDOCX") {
      downloadAsDocx();
    } else if (action === "Rename") {
      if (renameFileModalRef.current) {
        renameFileModalRef.current.openModal();
      }
    } else if (action === "Move") {
      moveFileModalRef.current.openModal();
    } else if (action === "Open") {
      setIsOpenModalOpen(true);
    } else if (action === "Delete") {
      handleDeleteFile();
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



  // Delete file function
  const handleDeleteFile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch('https://api.bungo.rocks/protected/delete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          itemID: id,
          itemType: 'file',
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('File deleted successfully:', data);

      // Navigate to /home after successful deletion
      navigate('/home');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Function to handle moving the file
  const handleMoveFile = async (targetFolderID) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch('https://api.bungo.rocks/protected/move-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          itemID: id,
          targetFolderID: targetFolderID || null,
          itemType: 'file',
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('File moved successfully:', data);
      // Optionally, display a success message or update the UI
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

  // Rename file function
  const handleRenameFile = async (newName) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch('https://api.bungo.rocks/protected/rename-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          fileID: id,
          newFileName: newName,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('File renamed successfully:', data);
      setFileName(newName);
    } catch (error) {
      console.error('Error renaming file:', error);
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

  const closeModal = () => {
    setIsOpenModalOpen(false);
  }

  const handleFileSelect = (fileId) => {
    setIsOpenModalOpen(false);
    navigate(`/document/${fileId}`);
  };
  
  return (
    <div className={styles.container}>
      {/* Header & MenuBar */}
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <Link to="/home" className={styles.iconLink}>
            <FaFileAlt className={styles.documentIcon} />
          </Link>
          <h3>{fileName || id}</h3>
        </div>
        <Account className={styles.account} />
      </div>
      <MenuBar onMenuAction={handleMenuAction} className={styles.menuBar} />

      {/* Editor */}
      <div className={styles.editor}>
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleContentChange}
          modules={DocumentEditor.modules}
          formats={DocumentEditor.formats}
        />
      </div>

      {/* Modals */}
      <Modal isOpen={isOpenModalOpen} onClose={closeModal}>
        <h2>Select a Document to Open</h2>
        <FileBrowser onFileSelect={handleFileSelect} />
      </Modal>
      <RenameFileModal
        ref={renameFileModalRef}
        currentFileName={fileName}
        onRename={handleRenameFile}
      />
      <FileNameModal ref={fileNameModalRef} />
      <MoveFileModal ref={moveFileModalRef} onMove={handleMoveFile} />
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
