"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

function Publication({ publication }) {
  const openUrlInNewTab = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => openUrlInNewTab(publication.url)}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '10px' }}>{publication.title}</h2>
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

const Search = () => {
  const [scrapedData, setScrapedData] = useState(null);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // Track component mount state

  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const site = searchParams.get('site');

  useEffect(() => {
    setIsMounted(true); // Set component mount state to true when mounted
    return () => setIsMounted(false); // Set component mount state to false when unmounted
  }, []);

  useEffect(() => {
    if (isMounted) {
      const fetchData = async () => {
        try {
          console.log('Fetching data from API...');
          if (site === 'dergipark') {
            const response = await axios.post(`/api/scrapeDP`, {
              Search: search,
            });
            console.log(response.data);
            setScrapedData(response.data);
          }
          else {
            const response = await axios.post(`/api/scrape`, {
              Search: search,
            });
            console.log(response.data);
            setScrapedData(response.data);
          }

        } catch (error) {
          console.error('Error:', error);
          setError(error);
        }
      };

      fetchData();
    }
  }, [isMounted, search]); // Run fetchData only when isMounted or search changes

  return (
    <div>
      {error ? (
        <p>Error: {error.message}</p>
      ) : scrapedData ? (
        <div>
          <h1>Publications</h1>
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          </div>

          {
            scrapedData.map(publication => (
              <Publication key={publication._id} publication={publication} />
            ))
          }
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Search;
