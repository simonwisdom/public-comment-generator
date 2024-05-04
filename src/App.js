import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [documentNumber, setDocumentNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const [interest, setInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentNumberChange = (event) => {
    setDocumentNumber(event.target.value);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleGroupChange = (event) => {
    setGroup(event.target.value);
  };

  const handleInterestChange = (event) => {
    setInterest(event.target.value);
  };

  const handleSummarizeDoc = () => {
    fetch('https://public-comment-generator-roan.vercel.app/api/summarize-doc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentNumber }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTitle(data.title); // Now setting the title
        setSummary(data.summary);
        console.log('Data received:', data);
      })
      .catch(error => {
        console.error('Error:', error);
        setSummary('Error occurred while fetching summary');
        setTitle(''); // Reset title if there is an error
      });
  };

  const handleGeneratePDF = () => {
    const payload = {
      title,
      summary,
      group,
      interest
    };
    console.log('Payload to send:', payload);
  
    fetch('https://public-comment-generator-roan.vercel.app/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px'; // Set a fixed height or make it responsive
        iframe.src = url;
        document.getElementById('pdfViewer').appendChild(iframe);
      })
      .catch((error) => console.error('Error:', error));
  };
  
  return (
    <div className="container">
      <h1>Enter Document Number (in the form XXXX-XXXXX)</h1>
      <input className="input" type="text" value={documentNumber} onChange={handleDocumentNumberChange} />
      <button className="button" onClick={handleSummarizeDoc} disabled={isLoading}>{isLoading ? 'Loading...' : 'Summarize Document'}</button>
      <h2>Document Title</h2>
      <p className="output">{title}</p>
      <h2>Summary</h2>
      <p className="output">{summary}</p>
      <h2>Enter Details</h2>
      <label>
        Title:
        <input className="input" type="text" value={title} onChange={handleTitleChange} />
      </label>
      <br />
      <label>
        Group:
        <input className="input" type="text" value={group} onChange={handleGroupChange} />
      </label>
      <br />
      <label>
        Interest:
        <input className="input" type="text" value={interest} onChange={handleInterestChange} />
      </label>
      <br />
      <button className="button" onClick={handleGeneratePDF} disabled={isLoading}>{isLoading ? 'Creating PDF...' : 'Generate PDF'}</button>
      <div id="pdfViewer"></div>
    </div>
  );
  
};

export default App;
