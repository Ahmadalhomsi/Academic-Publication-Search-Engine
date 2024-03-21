"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Publication({ publication }) {
    const openUrlInNewTab = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => openUrlInNewTab(publication.url)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '10px' }}>{publication.title}</h2>
                <p><strong>Authors:</strong> {publication.ID}</p>
                <p><strong>Authors:</strong> {publication.authors}</p>
                <p><strong>Publication Type:</strong> {publication.publicationType}</p>
                <p><strong>Publication Date:</strong> {publication.publicationDate}</p>
                <p><strong>Publisher:</strong> {publication.publisher}</p>
                <p><strong>Keywords:</strong> {publication.keywords}</p>
                <p><strong>Publication's Keywords:</strong> {publication.pKeywords}</p>
                <p><strong>Abstract:</strong> {publication.abstract}</p>
                <p><strong>References:</strong> {publication.references}</p>
                <p><strong>Citations:</strong> {publication.citations}</p>
                <p><strong>DOI:</strong> {publication.doi}</p>
                <p><strong>URL:</strong> {publication.url}</p>
                {/* Add other publication details as needed */}
            </div>
        </div>
    );
}

function PublicationPage() {
    const [publications, setPublications] = useState([]);
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [filters, setFilters] = useState({ publicationDate: '', keywords: '' });

    useEffect(() => {
        async function fetchPublications() {
            try {
                const response = await axios.get('http://localhost:3000/api/getPublications'); // Assuming your API endpoint is '/api/publications'
                setPublications(response.data);
                setFilteredPublications(response.data);
            } catch (error) {
                console.error('Error fetching publications:', error);
            }
        }

        fetchPublications();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const applyFilters = () => {
        let filteredResults = [...publications];

        if (filters.publicationDate) {
            filteredResults = filteredResults.filter(publication => publication.publicationDate.includes(filters.publicationDate));
        }

        if (filters.keywords) {
            filteredResults = filteredResults.filter(publication => publication.keywords.toLowerCase().includes(filters.keywords.toLowerCase()));
        }

        setFilteredPublications(filteredResults);
    };


    return (
        <div>
            <h1>Publications</h1>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                    type="text"
                    name="publicationDate"
                    placeholder="Publication Date"
                    value={filters.publicationDate}
                    onChange={handleFilterChange}
                    style={{ width: '300px', backgroundColor: 'white', color: 'black' }} // Adjust for dark mode
                />
                <input
                    type="text"
                    name="keywords"
                    placeholder="Keywords"
                    value={filters.keywords}
                    onChange={handleFilterChange}
                    style={{ width: '320px', backgroundColor: 'white', color: 'black' }} // Adjust for dark mode
                />
                <button onClick={applyFilters} style={{ marginTop: '10px' }}>Apply Filters</button>
            </div>
            <p>Total Publications: {filteredPublications.length}</p>


            {filteredPublications.length === 0 ? <div>No publications found.</div> :
                filteredPublications.map(publication => (
                    <Publication key={publication._id} publication={publication} />
                ))
            }
        </div>
    );
}

export default PublicationPage;
