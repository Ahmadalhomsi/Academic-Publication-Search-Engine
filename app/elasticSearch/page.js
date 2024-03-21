"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";




export default function Page() {
    const [field, setField] = useState('');
    const [scores, setScores] = useState(null);
    const [gScores, setGScores] = useState(null); // without any filter
    const [publications, setPublications] = useState([]);
    const [showFullAbstract, setShowFullAbstract] = useState({});
    const [showFullReferences, setShowFullReferences] = useState({});
    const [sortByDateAscending, setSortByDateAscending] = useState(true);
    const [sortByCitationsAscending, setSortByCitationsAscending] = useState(true);
    const [filters, setFilters] = useState({
        author: '',
        publicationType: '',
        publicationDate: '',
        publisher: '',
        keywords: '',
        pKeywords: '',
        citations: ''
        // Add more filter options here if needed
    });
    const [language, setLanguage] = useState('english'); // Default language is English
    const [correctedPhrase, setCorrectedPhrase] = useState('');
    const [corrector, setCorrector] = useState(true);




    const fetchPublications = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/getPublications');
            setPublications(response.data);
            toast.success("All Publications Fetched");
        } catch (error) {
            console.error('Error fetching publications:', error);
        }
    };


    // Function to show all publications
    const fetchAllPublications = async () => {
        try {
            if (publications.length === 0) {
                console.log("No publications found");
            } else {
                const tempScores = publications.map((publication, index) => ({
                    _source: {
                        ID: publication.ID,
                        title: publication.title,
                        authors: publication.authors,
                        publicationType: publication.publicationType,
                        publicationDate: publication.publicationDate,
                        publisher: publication.publisher,
                        keywords: publication.keywords,
                        pKeywords: publication.pKeywords,
                        abstract: publication.abstract,
                        references: publication.references,
                        citations: publication.citations,
                        doi: publication.doi,
                        url: publication.url
                    },
                    _score: 0 // You can set a default value for _score if needed
                }));
                setScores(tempScores);

            }
        } catch (error) {
            console.log('Error fetching publications:', error);
        }
    };






    const handleSearch = async () => {
        try {
            if (corrector) {
                // Send the selected language along with the search text
                const response = await axios.post("http://localhost:3000/api/spellingChecker", {
                    field,
                    language
                });
                if (response.data) {
                    // If spellingChecker API response is empty, set corrected phrase and show "Did you mean" button
                    setCorrectedPhrase(response.data);

                } else {
                    setCorrectedPhrase('');
                    // Proceed with the search using the corrected field
                    const searchResponse = await axios.post('http://localhost:3000/api/elasticSearch', {
                        field, // Use corrected phrase if available
                        publications
                    });

                    setScores(searchResponse.data);
                    setGScores(searchResponse.data);
                    toast.success("Got " + searchResponse.data.length + " Publications");
                }
            }
            else {
                const searchResponse = await axios.post('http://localhost:3000/api/elasticSearch', {
                    field, // Use corrected phrase if available
                    publications
                });

                setScores(searchResponse.data);
                setGScores(searchResponse.data);

            }


        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const handleDidYouMean = () => {
        // Replace the search box text with the corrected phrase
        setField(correctedPhrase);
    };



    const handleSortByDate = () => {
        const sortedScores = [...scores];
        sortedScores.sort((a, b) => {
            const dateA = formatDate(a._source.publicationDate);
            const dateB = formatDate(b._source.publicationDate);
            return sortByDateAscending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        });
        setScores(sortedScores);
        setSortByDateAscending(!sortByDateAscending);
    };

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month}-${day}`;
    };

    const handleSortByCitations = () => {
        const sortedScores = [...scores].sort((a, b) => {
            const citationsA = parseInt(a._source.citations);
            const citationsB = parseInt(b._source.citations);
            return sortByCitationsAscending ? citationsA - citationsB : citationsB - citationsA;
        });

        setScores(sortedScores);
        setSortByCitationsAscending(!sortByCitationsAscending);
    };

    const openUrlInNewTab = (url) => {
        window.open(url, '_blank');
    };

    useEffect(() => {
        applyFilters();
    }, [filters]);


    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    // Filter function for author
    const filterByAuthor = (item) => {
        return item._source.authors.toLowerCase().includes(filters.author.toLowerCase());
    };

    // Filter function for publication type
    const filterByPublicationType = (item) => {
        return item._source.publicationType.toLowerCase().includes(filters.publicationType.toLowerCase());
    };

    // Filter function for publication date
    const filterByPublicationDate = (item) => {
        return item._source.publicationDate.includes(filters.publicationDate);
    };

    // Filter function for publisher
    const filterByPublisher = (item) => {
        return item._source.publisher.toLowerCase().includes(filters.publisher.toLowerCase());
    };

    // Filter function for keyword
    const filterByKeyword = (item) => {
        return item._source.keywords.toLowerCase().includes(filters.keywords.toLowerCase());
    };

    // Filter function for pKeyword
    const filterBypKeyword = (item) => {
        return item._source.pKeywords.toLowerCase().includes(filters.pKeywords.toLowerCase());
    };

    // Filter function for Citations
    const filterByCitations = (item) => {
        return item._source.citations.includes(filters.citations);
    };



    // Apply filters to scores
    const applyFilters = () => {
        let filteredScores = scores;
        if (filters.author) {
            filteredScores = filteredScores.filter(filterByAuthor);
        }
        if (filters.publicationType) {
            filteredScores = filteredScores.filter(filterByPublicationType);
        }
        if (filters.publicationDate) {
            filteredScores = filteredScores.filter(filterByPublicationDate);
        }
        if (filters.publisher) {
            filteredScores = filteredScores.filter(filterByPublisher);
        }
        if (filters.keywords) {
            filteredScores = filteredScores.filter(filterByKeyword);
        }
        if (filters.pKeywords) {
            filteredScores = filteredScores.filter(filterBypKeyword);
        }
        if (filters.citations) {
            filteredScores = filteredScores.filter(filterByCitations);
        }
        setScores(filteredScores);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            author: '',
            publicationType: '',
            publicationDate: '',
            publisher: '',
            keywords: '',
            pKeywords: '',
            citations: ''
        });
        setScores(gScores); // Reset scores to the original list of publications
    };


    const handleToggle = () => {
        setCorrector(prevState => !prevState);
        // You can add additional logic here based on the state change
    };


    return (
        <div className="flex flex-col items-center space-y-1" >
            <div className="flex ">
                <input
                    type="text"
                    name="author"
                    placeholder="Author..."
                    value={filters.author}
                    onChange={handleFilterChange}
                    className="border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <input
                    type="text"
                    name="publicationType"
                    placeholder="Publication Type..."
                    value={filters.publicationType}
                    onChange={handleFilterChange}
                    className="border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <input
                    type="text"
                    name="publicationDate"
                    placeholder="Publication Date..."
                    value={filters.publicationDate}
                    onChange={handleFilterChange}
                    className="border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <input
                    type="text"
                    name="publisher"
                    placeholder="Publisher..."
                    value={filters.publisher}
                    onChange={handleFilterChange}
                    className="border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <input
                    type="text"
                    name="keywords"
                    placeholder="Keyword..."
                    value={filters.keywords}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-l px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <input
                    type="text"
                    name="pKeywords"
                    placeholder="pKeywords..."
                    value={filters.pKeywords}
                    onChange={handleFilterChange}
                    className="border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <button
                    onClick={applyFilters}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Apply Filters
                </button>
                <button
                    onClick={resetFilters}
                    className="bg-red-500 text-white rounded px-2 py-1 ml-1 hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                    Reset Filters
                </button>
            </div>

            <div className="flex items-center space-x-2">
                <div>
                    {/* Toggle button */}
                    <label>
                        Enable Correction
                        <input
                            type="checkbox"
                            checked={corrector}
                            onChange={handleToggle}
                        />
                    </label>
                </div>
                <label>
                    English
                    <input
                        type="radio"
                        name="language"
                        value="english"
                        checked={language === 'english'}
                        onChange={() => setLanguage('english')}
                    />
                </label>
                <label>
                    English 2
                    <input
                        type="radio"
                        name="language"
                        value="english2"
                        checked={language === 'english2'}
                        onChange={() => setLanguage('english2')}
                    />
                </label>

            </div>

            <div>
                <button
                    onClick={() => {
                        fetchAllPublications();
                    }}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Show All Publications
                </button>

                <button
                    onClick={fetchPublications}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Fetch Publications
                </button>

                <input
                    type="text"
                    placeholder="Enter keywords..."
                    value={field}
                    onChange={(e) => {
                        setField(e.target.value);
                    }}
                    className="border border-gray-300 rounded-l px-2 py-1 focus:outline-none focus:border-blue-500 text-blue-700"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Search
                </button>
                <button
                    onClick={handleSortByDate}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    {sortByDateAscending ? 'Sort by Date Asc' : 'Sort by Date Desc'}
                </button>
                <button
                    onClick={handleSortByCitations}
                    className="bg-blue-500 text-white rounded-r px-2 py-1 ml-1 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    {sortByCitationsAscending ? 'Sort by Citations Asc' : 'Sort by Citations Desc'}
                </button>


            </div>

            {/* Did you mean button */}
            {correctedPhrase && (
                <button onClick={handleDidYouMean}>
                    Did you mean: {correctedPhrase}?
                </button>
            )}

            {scores && (
                <div>
                    <h2 className="text-sm font-semibold">Scores:</h2>
                    <ul>
                        {scores.map((result, index) => (
                            <li key={index}>
                                <div className="mt-2 max-w-xl mx-auto border border-gray-300 rounded px-4 py-2 relative">
                                    <button className="absolute top-0 right-0 text-blue-500 text-xs mr-2 mt-2" onClick={() => openUrlInNewTab(result._source.url)}>
                                        Open Link
                                    </button>
                                    <p className="text-xs"><strong>ID:</strong> {result._source.ID}</p>
                                    <p className="text-xs"><strong>Title:</strong> {result._source.title}</p>
                                    <p className="text-xs"><strong>Authors:</strong> {result._source.authors}</p>
                                    <p className="text-xs"><strong>Publication Type:</strong> {result._source.publicationType}</p>
                                    <p className="text-xs"><strong>Publication Date:</strong> {result._source.publicationDate}</p>
                                    <p className="text-xs"><strong>Publisher:</strong> {result._source.publisher}</p>
                                    <p className="text-xs"><strong>Keywords:</strong> {result._source.keywords}</p>
                                    <p className="text-xs"><strong>Publication's Keywords:</strong> {result._source.pKeywords}</p>
                                    <button className="text-blue-500 text-xs mr-2" onClick={() => setShowFullAbstract(prevState => ({ ...prevState, [index]: !prevState[index] }))}>
                                        {showFullAbstract[index] ? 'Hide Abstract' : 'Show Abstract'}
                                    </button>
                                    <button className="text-blue-500 text-xs" onClick={() => setShowFullReferences(prevState => ({ ...prevState, [index]: !prevState[index] }))}>
                                        {showFullReferences[index] ? 'Hide References' : 'Show References'}
                                    </button>
                                    {showFullAbstract[index] && (
                                        <>
                                            <p className="text-xs"><strong>Abstract:</strong> {result._source.abstract}</p>
                                        </>
                                    )}
                                    {showFullReferences[index] && (
                                        <>
                                            <p className="text-xs"><strong>References:</strong> {result._source.references}</p>
                                        </>
                                    )}
                                    <p className="text-xs"><strong>Citations:</strong> {result._source.citations}</p>
                                    <p className="text-xs"><strong>DOI:</strong> {result._source.doi}</p>
                                    <p className="text-xs"><strong>URL:</strong> {result._source.url}</p>
                                    <p className="text-xs"><strong>_score:</strong> {result._score}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}
