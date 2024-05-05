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
  const [officialLogoUrl, setOfficialLogoUrl] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

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

  const handleSearchOfficialLogo = () => {
    setIsLoading(true);
    fetch('https://public-comment-generator-roan.vercel.app/api/search-clearbit-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group })
    })
      .then(response => response.json())
      .then(data => {
        if (data.logoUrl) {
          setOfficialLogoUrl(data.logoUrl);
        } else {
          setOfficialLogoUrl('No matching logo found, you could try different wording');
        }
        if (data.address) {
          setCompanyAddress(data.address);
        } else {
          setCompanyAddress('');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
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
      generatedLogoUrl: logoSelected ? logoUrl : null,
      officialLogoUrl: officialLogoUrl.startsWith('data:') ? officialLogoUrl : null,
      address: companyAddress 
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
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Generate a high quality PDF for public comment</h1>
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
        What company/industry/lobby group do you represent?:
        <input className="input" type="text" value={group} onChange={handleGroupChange} />
      </label>
      <button className="button" onClick={handleSearchOfficialLogo} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search for official logo (optional)'}
      </button>
      {officialLogoUrl && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {officialLogoUrl.startsWith('data:') ? (
            <img src={officialLogoUrl} alt="Official Logo" />
          ) : (
            <p>{officialLogoUrl}</p>
          )}
          {companyAddress && (
            <p style={{ marginLeft: '16px' }}>{companyAddress}</p>
          )}
        </div>
      )}
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

      {/* Conditionally render the Clearbit credit link */}
      {(logoUrl || officialLogoUrl) && (
        <footer>
          <p>Logo provided by <a href="https://clearbit.com" target="_blank" rel="noopener noreferrer">Clearbit.com</a></p>
        </footer>
      )}

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
