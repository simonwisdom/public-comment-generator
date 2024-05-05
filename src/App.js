import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [documentNumber, setDocumentNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const [interest, setInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSelected, setLogoSelected] = useState(false);

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
    setIsLoading(true);
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
        setTitle(data.title);
        setSummary(data.summary);
        console.log('Data received:', data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setSummary('Error occurred while fetching summary');
        setTitle('');
        setIsLoading(false);
      });
  };

  const handleGenerateLogo = () => {
    setIsLoading(true);
    fetch('https://public-comment-generator-roan.vercel.app/api/generate-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group })
    })
      .then(response => response.json())
      .then(data => {
        setLogoUrl(data.logoUrl);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const handleGeneratePDF = () => {
    setIsLoading(true);
    const payload = {
      title,
      summary,
      group,
      interest,
      logoUrl: logoSelected ? logoUrl : null
    };
    fetch('https://public-comment-generator-roan.vercel.app/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.blob())
      .then(blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.src = url;
        document.getElementById('pdfViewer').innerHTML = '';
        document.getElementById('pdfViewer').appendChild(iframe);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  return (
    <div className="container">
      <h1>Enter Document Number (in the form XXXX-XXXXX)</h1>
      <input className="input" type="text" value={documentNumber} onChange={handleDocumentNumberChange} />
      <button className="button" onClick={handleSummarizeDoc} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Summarize Document'}
      </button>

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
        What industry/lobby group do you represent?:
        <input className="input" type="text" value={group} onChange={handleGroupChange} />
      </label>
      <br />
      <label>
        What is your vested interest in this legislation? How will this affect you?:
        <input className="input" type="text" value={interest} onChange={handleInterestChange} />
      </label>
      <br />
      {/* <button className="button" onClick={handleGenerateLogo} disabled={isLoading}>
        {isLoading ? 'Generating Logo...' : 'Generate Logo'}
      </button>
      {logoUrl && <img src={logoUrl} alt="Generated Logo" />}
      {logoUrl && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={logoSelected}
              onChange={() => setLogoSelected(!logoSelected)}
            />
            Select This Logo
          </label>
        </div>
      )} */}
      <br />
      <button className="button" onClick={handleGeneratePDF} disabled={isLoading}>
        {isLoading ? 'Creating PDF...' : 'Generate PDF'}
      </button>

      <div id="pdfViewer"></div>

      {isLoading && (
        <div className="modal">
          <div className="modal-content">
            <div className="loader"></div>
            <p>Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
