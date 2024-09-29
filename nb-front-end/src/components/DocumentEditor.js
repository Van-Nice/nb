import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuBar from "./MenuBar"
import { FaFileAlt} from 'react-icons/fa';
import styles from '../styles/DocumentEditor.module.css'
import Account from './Account';


function DocumentEditor() {
  const { id } = useParams(); // Get the document ID from the URL
  const [content, setContent] = useState('');
  // const [fileName, setFileName] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Establish WebSocket connection with the token as a query parameter
    ws.current = new WebSocket(`ws://localhost:8080/protected/ws?token=${encodeURIComponent(token)}`);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      // Handle incoming messages
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const loadDocument = async () => {
      const savedContent = localStorage.getItem(`document-${id}`);
      if (savedContent) {
        setContent(savedContent);
      }
    };
    loadDocument();
  }, [id]);

  const handleContentChange = (value) => {
    setContent(value);
    localStorage.setItem(`document-${id}`, value);

    // Send the updated content to the server via WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({id, content: value}));
    }
  };

  const handleMenuAction = (action) => {
    if (action === 'Save') {
      console.log('Saving document...');
      // You can handle save action here
    } else if (action === 'New') {
      setContent('');
      console.log('New document created');
    } else if (action === 'Download') {
      console.log('Download document');
      // You can trigger a download action here
    }
  };

  return (
    <div>
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <FaFileAlt className={styles.documentIcon}/>
          <h3>{id}</h3>
        </div>
        <Account className={styles.account}/>
      </div>
      <MenuBar onMenuAction={handleMenuAction} className={styles.menubar}/>
      <div className={styles.editor}>
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={DocumentEditor.modules}
          formats={DocumentEditor.formats}
          style={{ height: '500px' }}
        />
      </div>
    </div>
  );
}

// Quill modules configuration
DocumentEditor.modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }, { 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'code-block'],
    ['clean']
  ],
};

// Quill formats configuration
DocumentEditor.formats = [
  'header', 'font', 'list', 'bullet', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'script', 'indent', 'direction', 'color', 'background', 'align', 'link', 'image', 'code-block'
];

export default DocumentEditor;