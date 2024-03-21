
const { NextResponse } = require("next/server");
import fs from 'fs';
import Publication from "@/models/Publication";
import dbConnect from '@/utils/dbConnect';


async function savePublication(publicationData) {
    try {
        const newPublication = await Publication.create(publicationData);
        console.log("Publication saved successfully");
        return newPublication;
    } catch (error) {
        console.error("Error saving publication:", error);
        throw error;
    }
}




export async function POST(req, res) {

    try {

        const data = await req.json()
        //console.log("QQQQQ ", data);
        //const publicationTitle = data.Versus;

        // Connect to MongoDB
        await dbConnect();



        // Read the uploaded file
        // const pdfData = fs.readFileSync(data.pdfData);

        const publicationData = {
            ID: data.ID,
            title: data.title,
            authors: data.authors,
            publicationType: data.publicationType,
            publicationDate: data.publicationDate,
            publisher: data.publisher,
            keywords: data.keywords,
            pKeywords: data.pKeywords,
            abstract: data.abstract,
            references: data.references,
            citations: data.citations,
            doi: data.doi,
            url: data.url,
            //pdfLink: data.pdfLink
        };

        // Sample publication data
        /*
        const publicationData = {
            title: "Sample PublicationZZZ223",
            authors: "John Doe",
            publicationType: "Journal Article",
            publicationDate: "2024-02-27",
            publisher: "Sample Publisher",
            keywords: "Sample Keywords",
            abstract: "This is a sample abstract.",
            references: "Sample References",
            citations: "Sample Citations",
            doi: "sample-doi",
            url: "https://example.com/sample-publication",
            pdfData: pdfData
        };
        */

        // Save the publication
        const newPublication = await savePublication(publicationData);

        // Return success response with the saved publication
        return NextResponse.json(newPublication);
    } catch (error) {
        // Return error response if saving the publication fails
        console.log(error);
        return NextResponse.json("WWW" + error);
    }
}
