import {ChatOpenAI} from "@langchain/openai"
import express from "express"
import bodyParser from "body-parser";

const model = new ChatOpenAI({
    temperature: 1,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})


const app = express()
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, Origin');
    next();
})
const port = 3000

let messages = [];
let character;
let systemPrompt;
let prompt;

app.post('/chat', async (req, res) => {
    if (req.body.character === '1') {
        if (character !== 'Harry Potter') {
            messages.splice(0, messages.length);
        }
        character = `Harry Potter`;
        systemPrompt = `Hi, I want to have a conversation with a fictional character. Can you pose as if you are ${character}? 
        You should change the subject sometimes and ask the user questions. 
        Give normal and everyday answers without explaining to much if the user is not asking for it.`;
        prompt = req.body.query;
    }
    if (req.body.character === '2') {
        if (character !== 'Percy Jackson') {
            messages.splice(0, messages.length);
        }
        character = `Percy Jackson`;
        systemPrompt = `Hi, I want to have a conversation with a fictional character. Can you pose as if you are ${character}? 
        You should change the subject sometimes and ask the user questions. 
        Give normal and everyday answers without explaining to much if the user is not asking for it.`;
        prompt = req.body.query;
    }
    if (req.body.character === '3') {
        if (character !== 'Zeus') {
            messages.splice(0, messages.length);
        }
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_KEY}&q=${req.body.lat}, ${req.body.long}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        const weather = await response.json();
        character = 'Zeus';
        systemPrompt = `Hi, I want to have a conversation with a fictional character. Can you pose as if you are ${character}?
         You can give information about the current weather of the person talking to you. 
         As Zeus you have control over all weather, so you need to bring it to the user as if you made the current weather happen. 
         You are grumpy because a mortal is wasting your time with annoying questions.
         You can find the weather information between the following brackets [weather][/weather]. You can not talk about any other weather information than the information i have given you.
         You can find the user question between the following brackets [question][/question].`;
        prompt = `This is the current weather: [weather]
        Temperature: ${weather.current.temp_c} degrees celsius.
        Condition: ${weather.current.condition.text}.
        Wind speed: ${weather.current.wind_kph}kph.
        Perceived temperature: ${weather.current.feelslike_c} degrees celsius.
        Uv: ${weather.current.uv}
        [/weather]. And this is the question: [question]` + req.body.query + `[/question].`;
    }
    if (req.body.character === '0') {
        return res.status(400).send({message: 'Please choose a character.'});
    }
    if (messages.length === 0) {
        messages.push(["system", systemPrompt]);
    }
    messages.push(["human", prompt]);
    const query = await model.invoke(messages);
    res.json(query.content);
    messages.push(
        ["ai", query.content]
    );
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

