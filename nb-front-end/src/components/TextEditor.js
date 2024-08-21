import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function TextEditor() {
  const [content, setContent] = useState('');

  const handleSave = () => {
    // Save logic here
    console.log('Post saved:', content);
  };

  const handleSubmit = () => {
    // Submit logic here
    console.log('Post submitted:', content);
  };

  return (
    <div>
      <ReactQuill value={content} onChange={setContent} modules={TextEditor.modules} formats={TextEditor.formats} />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

TextEditor.modules = {
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

TextEditor.formats = [
  'header', 'font', 'list', 'bullet', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'script', 'indent', 'direction', 'color', 'background', 'align', 'link', 'image', 'code-block'
];