 Project Title: Academic Publication Search Engine
 ===============

## **Overview**:
This project aims to develop a user-friendly web interface for searching and accessing academic publications retrieved through web scraping from academic search engines like Google Scholar. The collected data is stored in a MongoDB database and indexed using Elasticsearch for efficient querying. The web interface allows users to search for publications based on keywords, apply filters, and sort results based on publication date or citation count.


## Features:
Web Scraping: Utilizes web scraping techniques to retrieve academic publication data from search engine results pages (SERPs).  
Database: Stores publication data in a MongoDB database for efficient retrieval and management.  
Search Engine: Implements Elasticsearch for powerful and fast search capabilities.  
User Interface: Provides a user-friendly web interface for searching and browsing academic publications.  
Filters and Sorting: Allows users to filter search results based on various criteria and sort publications by date or citation count.  
Spelling Checker: Integrates with Textgears and X-RapidAPI for English spelling checking capabilities.  


## Technologies Used:
**Search Engine**: Google Scholar (PDF download not included), Dergi Park 
**Frontend**: React.js  
**Backend**: Node.js, Next.js  
**Database**: MongoDB  
**Search Engine**: Elasticsearch  
**Web Scraping**: Axios, Cheerio, Puppeteer  
**Spelling Checker APIs**: Textgears, X-RapidAPI  

## Setup Instructions:
Clone the repository: git clone https://github.com/yourusername/academic-publication-search.git  
Navigate to the project directory: cd academic-publication-search  
Install dependencies: ``npm install``  
Create a .env file in the project root and add the following variables:  

```bash
Mongo_DB = ' ' // Database URI Link
Textgears_API_Key = ' ' // English Spelling Checker API Key
X_RapidAPI_Key = ' ' // English 2 Spelling Checker API Key
Elastic_Search_API_Key = ' ' // Elasticsearch API Key
```

Start the development server: `npm start`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Screenshots:
(Insert screenshots here)

## Additional Notes:
For detailed information on project architecture, functionality, and usage, refer to the project's documentation.
Contributions and feedback are welcome. Feel free to submit a pull request or open an issue on GitHub.
Contributors:
John Doe (john.doe@example.com)
Jane Smith (jane.smith@example.com)
License:
This project is licensed under the MIT License. See the LICENSE file for details.


[`next/font`](https://nextjs.org/docs/basic-features/font-optimization)
[Next.js deployment documentation]