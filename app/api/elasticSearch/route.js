import axios from "axios";
import { NextResponse } from "next/server";
import { Client } from '@elastic/elasticsearch';

export async function POST(req) {
    try {
        const data = await req.json();
        const field = data.field;
        const Publications = data.publications;
        console.log("VField:", field);
        //console.log("VPublications:" , Publications);

        // Initialize Elasticsearch client
        const client = new Client({
            node: 'https://25ad891dad424472a3a3f780a6806560.us-central1.gcp.cloud.es.io:443',
            auth: {
                apiKey: process.env.Elastic_Search_API_Key
            }
        });

        // Sample data books
        let dataset = [];

        // Index each publication into Elasticsearch and add additional fields
        // Assuming Publications is an array of publication objects
        Publications.forEach(publication => {
            dataset.push({
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
                url: publication.url,
            });
        });
        //console.log("XXXX: ", dataset);

        const deleteResult = await client.deleteByQuery({
            index: 'search-scrape',
            body: {
                query: {
                    match_all: {} // Match all documents
                }
            }
        });


        // Index data into Elasticsearch
        const result = await client.helpers.bulk({
            datasource: dataset,
            pipeline: "ent-search-generic-ingestion",
            onDocument: (doc) => ({ index: { _index: 'search-scrape' } }),
        });


        console.log('Data indexed:', result);


        /*
        // Perform a search query
        const searchResult = await client.search({
            index: 'search-scrape',
            size: 20,
            body: {
                query: {
                    multi_match: {
                        query: field,
                        fields: ['field', 'authors', 'keywords', 'abstract']
                    }
                }
            }
        });
        */

        // Perform a search query
        const searchResult = await client.search({
            index: 'search-scrape',
            size: 100,
            q: field // Example search query
        });
        console.log("Searched:",searchResult.hits.hits.length);

        //console.log('Search result:', searchResult.hits.hits);
        return NextResponse.json(searchResult.hits.hits);

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(error);
    }
}
