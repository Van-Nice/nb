import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

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

  const handleContentChange = (value) => {
    setContent(value);
    localStorage.setItem(`document-${id}`, value); // Save the content locally
  };

  return (
    <div>
      <h1>Editing Document ID: {id}</h1>
      <ReactQuill
        value={content}
        onChange={handleContentChange}
        modules={DocumentEditor.modules}
        formats={DocumentEditor.formats}
        style={{ height: '500px' }}
      />
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