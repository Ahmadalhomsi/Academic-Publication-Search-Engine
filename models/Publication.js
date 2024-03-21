import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const publicationSchema = new mongoose.Schema({
    ID: String,
    title: String,
    authors: String,
    publicationType: String,
    publicationDate: String,
    publisher: String,
    keywords: String,
    pKeywords: String,
    abstract: String,
    references: String,
    citations: String,
    doi: String,
    url: String,
    //pdfLink: String  

});


// Method to download and save the PDF file
publicationSchema.methods.downloadPDF = async function(savePath) {
    try {
        const fileName = `${this.title}.pdf`; // Generate file name based on publication title
        const filePath = path.join(savePath, fileName); // Generate full file path
        fs.writeFileSync(filePath, this.pdfData); // Write PDF data to file
        console.log('PDF file downloaded successfully:', filePath);
        return filePath; // Return the file path
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error; // Rethrow the error
    }
};

export default mongoose.models.Publication || mongoose.model('Publication', publicationSchema);
