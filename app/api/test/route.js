const { NextResponse } = require("next/server");



export async function GET() {


  const word = "helloeverybodylaidesandgentlement"

  
  return NextResponse.json({
    hello: word.includes('everyx'),
  });
}
