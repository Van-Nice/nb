import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DocumentEditor() {
  const { id } = useParams(); // Get the document ID from the URL
  const [content, setContent] = useState('');

  useEffect(() => {
    // You could load the document from the server based on the id here
    // For now, let's simulate loading existing content
    const loadDocument = async () => {
      const savedContent = localStorage.getItem(`document-${id}`);
      if (savedContent) {
        setContent(savedContent);
      }
    };
    loadDocument();
  }, [id]);

  const handleContentChange = (event) => {
    setContent(event.target.value);
    localStorage.setItem(`document-${id}`, event.target.value); // Save the content locally
  };

  return (
    <div>
      <h1>Editing Document ID: {id}</h1>
      <textarea
        style={{ width: '100%', height: '500px' }}
        value={content}
        onChange={handleContentChange}
      />
    </div>
  );
}

export default DocumentEditor;