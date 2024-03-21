import axios from 'axios';
import cheerio from 'cheerio';
import { NextResponse } from 'next/server';

const getTRPhraseCorrection = async (phrase) => {

    const encodedParams = new URLSearchParams();
    encodedParams.set('text', phrase);

    const options = {
        method: 'POST',
        url: 'https://ai-based-spelling-and-grammar-correction.p.rapidapi.com/data',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': process.env.X_RapidAPI_Key,
            'X-RapidAPI-Host': 'ai-based-spelling-and-grammar-correction.p.rapidapi.com'
        },
        data: encodedParams,
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

const getPhraseCorrection = async (phrase) => {
    try {
        const response = await axios.post('https://api.textgears.com/check.php', {
            text: phrase,
            key: process.env.Textgears_API_Key, // Replace with your API key
        });

        if (response.data.errors) {
            // Combine all suggested corrections into a single phrase
            let correctedPhrase = phrase;
            response.data.errors.forEach(error => {
                const original = error.bad;
                const suggestion = error.better[0]; // Take the first suggestion
                correctedPhrase = correctedPhrase.replace(original, suggestion);
            });
            return correctedPhrase;
        }

        return phrase; // No corrections suggested, return the original phrase
    } catch (error) {
        console.error(error);
        return phrase; // Return the original phrase in case of error
    }
};

export async function POST(req, res) {
    try {
        const data = await req.json();
        const searchTitle = data.field;
        const language = data.language;


        console.log("spelling:", searchTitle, language);

        let didYouMeanText;
        if (language === "english")
            didYouMeanText = await getPhraseCorrection(searchTitle);


        else
            didYouMeanText = await getTRPhraseCorrection(searchTitle);

        if (didYouMeanText) {
            console.log('Did you mean:', didYouMeanText);
            return NextResponse.json(didYouMeanText);
        } else {
            console.log('No "Did you mean" suggestion found.');
            return NextResponse.json(null);
        }
    } catch (error) {
        console.log('Error:', error);
        return NextResponse.error({ error: 'Internal Server Error' });
    }
}
