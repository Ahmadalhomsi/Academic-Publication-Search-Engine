import axios from 'axios';
import cheerio from 'cheerio';
import { NextResponse } from 'next/server';

const path = require('path');
const fsX = require('fs-extra');


const wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const downloadPdf = async (url, savePath) => {
    try {
        console.log("pdf url:", url);
        // Create directory if it doesn't exist
        await fsX.ensureDir(savePath);

        // Remove "http://" from the URL
        let filename = url.replace(/^https?:\/\//, '');

        // Replace "/" with "-"
        filename = filename.replace(/\//g, '-') + '.pdf';

        await wait(1100);

        // Make GET request to download the PDF file
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Save PDF to local directory with extracted filename
        const filePath = path.join(savePath, filename);
        await fsX.writeFile(filePath, response.data);

        return filePath;
    } catch (error) {
        console.log('Error downloading PDF:', error.message);

    }
};

export async function POST(req, res) {
    try {
        const data = await req.json();
        const searchTitle = data.Search;

        const searchUrl = `https://dergipark.org.tr/tr/search?q=${encodeURIComponent(searchTitle)}`;
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        const results = $('.card.article-card.dp-card-outline').slice(0, 10); // Limit to 10 results

        const publications = [];

        // Loop through each result and scrape basic details
        for (let i = 0; i < results.length; i++) {
            console.log(`Element number: ${i}`);

            const result = results.eq(i);
            const publicationDetails = {};

            // Extract basic details
            const url = result.find('.card-title a').attr('href');


            // Extract details from the publication page
            const publicationPageResponse = await axios.get(url);
            const $publicationPage = cheerio.load(publicationPageResponse.data);

            const urlParts = url.split('/'); // Split the URL by '/'
            const ID = urlParts.slice(-2).join('/'); // Get the last two parts and join them with '/'
            publicationDetails.ID = ID;


            let title = $publicationPage('h3.article-title').text().trim();

            /// Check for  - and Spaces
            if (title && title[0] === '-') {
                // Create a new string without the first character
                title = title.substring(1).trim(); // or title = title.slice(1).trim();

            }
            publicationDetails.title = title;


            const authorNames = $publicationPage('.article-authors a').map((_, element) => $(element).text().trim()).get();
            const uniqueAuthorNames = [...new Set(authorNames)]; // Remove duplicates
            publicationDetails.authors = uniqueAuthorNames.join(', ');

            publicationDetails.publicationType = $publicationPage('.kt-portlet__head-title').text().trim();

            // Extract publication date
            publicationDetails.publicationDate = $publicationPage('span.article-subtitle').text().trim().split(',').pop().trim();

            publicationDetails.publisher = $publicationPage('h1#journal-title').text().trim();

            // Extract keywords
            publicationDetails.keywords = $publicationPage('.article-keywords.data-section p a').map((_, element) => $(element).text().trim()).get().join(', ');

            // Extract keywords
            publicationDetails.pKeywords = searchTitle;

            // Extract abstract
            publicationDetails.abstract = $publicationPage('.article-abstract.data-section p').text().trim();

            // Extract references
            publicationDetails.references = $publicationPage('.article-citations.data-section .fa-ul li').map((_, element) => $(element).text().trim()).get().join('\n');

            // Extract citation count
            // Select the element by its class name
            const citationsElement = $publicationPage('.mt-3 a');

            // Check if the element exists
            if (citationsElement.length > 0) {
                // Extract the text content
                const citationsText = citationsElement.text().trim();

                // Extract the number of citations
                const citationsNumber = parseInt(citationsText.match(/\d+/)[0]);

                // Assign the number of citations to publicationDetails.citations
                publicationDetails.citations = citationsNumber;
            } else {
                publicationDetails.citations = 0;
                // Handle the case where the element is not found
            }
            /*
            const str = $publicationPage('span.article-subtitle').text().trim();
            const regex = /Sayı:\s*(\d+)/; // Matches "number:", followed by zero or more spaces and one or more digits
            publicationDetails.citations = str.match(regex)?.[1]; // Access the captured group (number) if a match exists
            */


            // Extract DOI
            publicationDetails.doi = $publicationPage('a.doi-link').attr('href') || '';

            publicationDetails.url = url;

            // Extract PDF link
            const shortpdfLink = $publicationPage('a.article-tool.pdf').attr('href') || '';
            const pdfLinkX = `https://dergipark.org.tr${shortpdfLink}`

            // Download PDF if available

            try {
                const savePath = path.join(process.cwd(), 'downloads');
                const filePath = await downloadPdf(pdfLinkX, savePath);
                console.log("PDF Downloaded: ", shortpdfLink);
                //result.pdfLinkX = filePath;
            } catch (error) {
                console.log(`Error downloading ${pdfLinkX} PDF File:`, error);
            }




            // Push basic details to the publications array
            publications.push(publicationDetails);

            // Sending data to API
            try {
                const axr = await axios.post('http://localhost:3000/api/upload', publicationDetails);
                console.log("Data uploaded successfully:", axr.data.title);
            } catch (error) {
                console.log('Error uploading data:', error);
            }
        }

        return NextResponse.json(publications);
    } catch (error) {
        console.log('Error:', error);
        return NextResponse.error({ error: 'Internal Server Error' });
    }
}
