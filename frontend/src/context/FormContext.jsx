import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [mode, setMode] = useState('text');
  const [result, setResult] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('txt');

  const clearForm = () => {
    setTitle('');
    setText('');
    setFile(null);
    setVideoUrl('');
    setResult('');
  };

  return (
    <FormContext.Provider value={{
      title, setTitle,
      text, setText,
      file, setFile,
      videoUrl, setVideoUrl,
      mode, setMode,
      result, setResult,
      downloadFormat, setDownloadFormat,
      clearForm
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);