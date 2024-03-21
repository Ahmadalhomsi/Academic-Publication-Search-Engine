import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import axios from 'axios';
const { NextResponse } = require("next/server");
//const { NextApiRequest, NextApiResponse } = require('next');

// Import the keyword extractor
const keywordExtractor = require("keyword-extractor");


// Define the function to extract keywords
function extractKeywords(abstract, numKeywords = 5) {
  // Extract keywords from the abstract
  const keywords = keywordExtractor.extract(abstract, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  });

  // Take the top 'numKeywords' keywords
  const topKeywords = keywords.slice(0, numKeywords);

  // Join the keywords with commas
  const keywordsString = topKeywords.join(', ');

  return keywordsString;
}

const fs = require('fs');
const path = require('path');

//const axios = require('axios');
const fsX = require('fs-extra');
//const path = require('path');


const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const downloadPdf = async (url, savePath) => {
  try {
    // Create directory if it doesn't exist
    await fsX.ensureDir(savePath);

    // Remove "http://" from the URL
    let filename = url.replace(/^https?:\/\//, '');

    // Replace "/" with "-"
    filename = filename.replace(/\//g, '-');

    // Make GET request to download the PDF file
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Save PDF to local directory with extracted filename
    const filePath = path.join(savePath, filename);
    await fsX.writeFile(filePath, response.data);

    return filePath;
  } catch (error) {
    throw new Error('Error downloading PDF: ' + error.message);
  }
};

function uploadPDF(filePath) {
  try {
    // Read the PDF file as binary data
    const pdfData = fs.readFileSync(filePath);

    // Extract the filename from the file path
    const filename = path.basename(filePath);

    // Create a new PDF document
    const newPDF = new PDF({
      filename,
      pdfData: pdfData
    });

    // Save the PDF document to the database
    newPDF.save((err, savedPDF) => {
      if (err) {
        console.error('Error uploading PDF:', err);
      } else {
        console.log('PDF uploaded successfully:', savedPDF);
      }
    });
  } catch (error) {
    console.error('Error reading PDF file:', error);
  }
}




export async function POST(req, res) {
  try {
    const data = await req.json()
    const SearchTitle = data.Search;

    // Launch browser instance with English language preference
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--lang=en-US,en']
    });

    // Create a new page
    const page = await browser.newPage();

    await page.setViewport({
      width: 1100,
      height: 500,
    })
    /*
    width: 1300,
    height: 600,
    */

    // Navigate to Google Scholar search page
    await page.goto(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${encodeURIComponent(SearchTitle)}`, { waitUntil: "domcontentloaded" });
    /// OLD:  https://scholar.google.com/scholar?q=$


    // Wait for search results to load
    await page.waitForSelector('.gs_r');

    // Get the HTML content of the page
    const htmlContent = await page.content();

    // Load the HTML content into Cheerio
    const $ = cheerio.load(htmlContent);

    // Extract search results
    const searchResults = [];
    for (let index = 0; index < $('.gs_r').length; index++) {
      const element = $('.gs_r')[index];
      const result = {};

      console.log("Starting from the title:", index);
      // Extracting basic information
      result.title = $(element).find('.gs_rt a').text();

      /*
      if (result.title == "") {
        console.log("Skipped");
        continue; // Skip to the next iteration if title is empty
      }
      */

      // Authors
      const authorsText = $(element).find('.gs_a').text();
      result.authors = authorsText.split(' - ')[0]; // Assuming authors are listed first and separated by ' - '

      if (result.authors == "") {
        console.log("Skipped");
        continue; // Skip to the next iteration if title is empty
      }


      // Publication Type
      const publicationTypeLeft = $(element).find('.gs_ct1').text().trim();
      const publicationTypeRight = $(element).find('.gs_ctg2').text().trim();
      result.publicationType = publicationTypeLeft || publicationTypeRight || 'N/A';


      // Publication Date
      const publicationDateMatch = authorsText.match(/(\d{4})/);
      result.publicationDate = publicationDateMatch ? publicationDateMatch[0] : 'N/A';

      // Publisher
      const publisherMatch = authorsText.match(/- (\D.*) \d{4}/);
      result.publisher = publisherMatch ? publisherMatch[1].trim() : 'N/A';

      // Keywords
      result.keywords = SearchTitle;

      // Publication's Keywords
      //result.pKeywords=....;
      /*
      const $ = cheerio.load(htmlContent);
      const keywordsMeta = $('meta[name="keywords"]').attr('content');
      console.log(keywordsMeta); // Output: keyword1, keyword2, keyword3
      */

      // Abstract
      const abstractText = $(element).find('.gs_rs').text().trim();
      // Remove leading and trailing '...' from abstract
      result.abstract = abstractText.replace(/^\.+|\.+$/g, '');

      result.pKeywords = extractKeywords(result.abstract, 5);


      /// Click the "Cite" button for this specific search result
      try {
        const citeButton = await page.$('.gs_r:nth-child(' + (index + 1) + ') .gs_or_cit'); // here is the error
        if (citeButton) {
          console.log("before click");
          await citeButton.click();
          console.log("after click");
          // Introduce a delay to allow time for the citation data to appear
          await wait(1000); // Adjust the delay time as needed



          console.log("waiting for selector Cite");
          // Get the current URL before clicking the button
          const currentURL = page.url();
          if (!currentURL.includes("scholar.google.com/scholar")) {
            console.log("Entered", currentURL, !currentURL.includes("scholar.google.com/scholar"));
            //await page.goBack();
            await page.goto(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${encodeURIComponent(SearchTitle)}`, { waitUntil: "domcontentloaded" });
            continue;
          }


          // Wait for the citation data to appear
          await page.waitForSelector('.gs_citr');


          // Extract references from the citation data associated with the current result
          const references = await page.evaluate(() => {
            const referenceElements = document.querySelectorAll('.gs_citr');
            return Array.from(referenceElements).map(ref => ref.textContent.trim()).join('\n');
          });
          result.references = references;

          // Close the citation popup
          const closeButton = await page.$('.gs_ico');
          if (closeButton) {
            await closeButton.click();
          }
        }
      } catch (error) {
        console.log(error);
        await page.goto(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${encodeURIComponent(SearchTitle)}`, { waitUntil: "domcontentloaded" });
      }

      // Citations
      result.citations = $(element).find('.gs_fl a[href*="cites="]').text();

      // DOI
      const doiMatch = $(element).find('.gs_or_cit').text().match(/DOI\s?:\s?(.*)/i);
      result.doi = doiMatch ? doiMatch[1].trim() : 'N/A';

      // URL
      result.url = $(element).find('.gs_rt a').attr('href');

      // Download PDF if available
      /*
      const pdfLink = $(element).find('.gs_ggsd a').attr('href');
      if (pdfLink && pdfLink.includes('.pdf')) {
        try {
          const savePath = path.join(process.cwd(), 'downloads');
          const filePath = await downloadPdf(pdfLink, savePath);
          console.log("PDF Path: ", filePath);
          result.pdfLink = filePath;
        } catch (error) {
          console.error(`Error downloading ${pdfLink} PDF File:`, error);
        }
      }
      */

      // Push the result into searchResults array
      searchResults.push(result);

      // Sending data to API
      try {
        const response = await axios.post('http://localhost:3000/api/upload', result);
        console.log("Data uploaded successfully:", response.data);
      } catch (error) {
        console.error('Error uploading data:', error);
      }
    }

    // Getting data from API
    /* WILL DO THAT LATER
    try {
      const response = await axios.post('http://localhost:3000/api/getPublications', result);
      console.log("Data uploaded successfully:", response.data);
    } catch (error) {
      console.error('Error uploading data:', error);
    }
    */


    ////// *************


    // Close browser
    //await browser.close();

    // Return search results
    console.log("Scraping Has Been Finished");
    return NextResponse.json("Scraping Has Been Finished");

  } catch (error) {
    // Handle errors
    console.error('Error scraping Google Scholar:', error);
    return NextResponse.json({ error: 'Error scraping Google Scholar' });
  }
}

