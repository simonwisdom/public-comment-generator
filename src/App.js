import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const App = () => {
  const [data, setData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedSummary, setSelectedSummary] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(-1);
  const [selectedInterest, setSelectedInterest] = useState('');

  useEffect(() => {
    // Fetch and parse the CSV data
    fetch('/stakeholders.csv')
      .then(response => response.text())
      .then(csvData => {
        const parsedData = Papa.parse(csvData, { header: true });
        setData(parsedData.data);
      });
  }, []);

  const handleTitleChange = (event) => {
    const selected = event.target.value;
    setSelectedTitle(selected);
    const found = data.find(item => item.title === selected);
    if (found) {
      setSelectedSummary(found.summary || 'No summary available');
      try {
        const groups = JSON.parse(found.groups.replace(/'/g, '"')) || [];
        setSelectedGroups(groups);
        setSelectedInterest('');
        setSelectedGroupIndex(-1); // Reset group index when title changes
      } catch {
        setSelectedGroups([]);
        setSelectedInterest('');
        setSelectedGroupIndex(-1);
      }
    } else {
      setSelectedSummary('No summary available');
      setSelectedGroups([]);
      setSelectedInterest('');
      setSelectedGroupIndex(-1);
    }
  };

  const handleGroupChange = (event) => {
    const selected = parseInt(event.target.value, 10);
    setSelectedGroupIndex(selected);
    const found = data.find(item => item.title === selectedTitle);
    if (found && found.interests) {
      try {
        const interests = JSON.parse(found.interests.replace(/'/g, '"'));
        setSelectedInterest(interests[selected] || 'No interest available');
      } catch {
        setSelectedInterest('Interest data not properly formatted');
      }
    }
  };

  const handleGeneratePDF = () => {
    const payload = {
      title: selectedTitle,
      summary: selectedSummary,
      group: selectedGroups[selectedGroupIndex],
      interest: selectedInterest
    };
    console.log('Payload to send:', payload); // You can replace this with a POST request

    fetch('https://https://public-comment-generator-roan.vercel.app/api/generate-pdf', {
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
      <h1>Select a Title</h1>
      <select value={selectedTitle} onChange={handleTitleChange}>
        {data.map((item, index) => (
          <option key={index} value={item.title}>{item.title}</option>
        ))}
      </select>
      <h2>Summary</h2>
      <p>{selectedSummary}</p>
      <h2>Groups</h2>
      <select value={selectedGroupIndex} onChange={handleGroupChange}>
        <option value="-1">Select a group</option>
        {selectedGroups.map((group, index) => (
          <option key={index} value={index}>{group}</option>
        ))}
      </select>
      <h2>Interest</h2>
      <p>{selectedInterest}</p>
      <button onClick={handleGeneratePDF}>Generate PDF</button>
    </div>
  );
};

export default App;
