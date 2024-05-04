import React, { useState } from 'react';

const App = () => {
  const [documentNumber, setDocumentNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const [interest, setInterest] = useState('');

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
        setSummary(data.summary);
        console.log('Summary received:', data.summary);
      })
      .catch(error => {
        console.error('Error:', error);
        fetch('https://public-comment-generator-roan.vercel.app/api/summarize-doc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentNumber }),
        })
          .then(response => response.text())
          .then(errorText => {
            console.error('Server error:', errorText);
            setSummary('Error occurred while fetching summary');
          })
          .catch(error => {
            console.error('Error:', error);
            setSummary('Error occurred while fetching summary');
          });
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
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'output.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div>
      <h1>Enter Document Number</h1>
      <input type="text" value={documentNumber} onChange={handleDocumentNumberChange} />
      <button onClick={handleSummarizeDoc}>Summarize Document</button>
      <h2>Summary</h2>
      <p>{summary}</p>
      <h2>Enter Details</h2>
      <label>
        Title:
        <input type="text" value={title} onChange={handleTitleChange} />
      </label>
      <br />
      <label>
        Group:
        <input type="text" value={group} onChange={handleGroupChange} />
      </label>
      <br />
      <label>
        Interest:
        <input type="text" value={interest} onChange={handleInterestChange} />
      </label>
      <br />
      <button onClick={handleGeneratePDF}>Generate PDF</button>
    </div>
  );
};

export default App;