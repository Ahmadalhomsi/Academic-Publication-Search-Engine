import dbConnect from '@/utils/dbConnect';
import Publication from '@/models/Publication';
import { NextResponse } from 'next/server';


export async function GET(req, res) {
    // Connect to the database
    await dbConnect();

    try {
        // Fetch all publications from the database
        const publications = await Publication.find({});
        return NextResponse.json(publications);
    } catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
