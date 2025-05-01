import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import model from '../models/apiModels';

dotenv.config();

const NASA_API_KEY = process.env.NASA_API_KEY;
const MARS_URL = 'https://api.nasa.gov/insight_weather/?api_key=';
const NASA_URL = MARS_URL + NASA_API_KEY;
const NASA_POD_URL =
  'https://api.nasa.gov/planetary/apod?api_key=' + NASA_API_KEY;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/3.0/onecall?';

/*
Resources:
- InSight Lander Location: https://science.nasa.gov/mission/mars-2020-perseverance/location-map/
- handleForm React + Express: https://www.youtube.com/watch?v=GR5-aao7Y-0
- fetchAPI request: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

Links:
- Query URL format: http://localhost:3000/api/fetchEarthData?lat={lat}&lon={lon}
- Test URL format (for POSTMAN): http://localhost:3000/api/comparisonData?lat=33.44&lon=-94.04
*/

const promptOpenAI = async (prompt: string, client: OpenAI) => {
  const systemPrompt: string = fs.readFileSync(
    path.join(__dirname, './systemPrompt.txt'),
    'utf8'
  );
  try {
    // Learn more here: https://platform.openai.com/docs/api-reference/evals/run-output-item-object
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      store: true,
    });

    const response = completion.choices[0].message.content;
    return response;
  } catch (err: unknown) {
    throw new Error(`Error with completion inside promptOpenAI: ${err}`);
  }
};

const apiController = {
  getData: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {},

  // Fetch Earths' Weather Data Given LATITUDE & LONGITUDE
  fetchEarthData: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { lat, lon } = req.query;

    /*  FETCH EARTHS DATA
        "lat": 33.44,
        "lon": -94.04,
        "timezone": "America/Chicago",
        "timezone_offset": -18000,
        "daily": [
          {
            "dt": 1745690400, <---
            "temp": {
              "day": 300.86, <---
              "min": 291.57, <---
              "max": 300.86, <---
            },
            "pressure": 1018, <---
            "wind_speed": 3.48, <---
          },
       */

    try {
      /* 
      We can also get weather by:
      - City
      - State code
      - Country code
      https://api.openweathermap.org/data/2.5/weather?q={city name},{state code},{country code}&appid={API key}
      */
      const EARTH_URL =
        OPENWEATHER_URL +
        `lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      // console.log('### EARTH_URL ###');
      // console.log(EARTH_URL);

      const response = await fetch(
        OPENWEATHER_URL +
          `lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      if (!res.locals.weatherData) res.locals.weatherData = {};

      const randomDay = data.daily[0];
      const date = new Date(randomDay.dt * 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const yyyy = date.getFullYear();

      const mmddyyyy = `${mm}/${dd}/${yyyy}`; // "04/27/2025"

      // Metrics interpretation - https://openweathermap.org/current
      res.locals.weatherData.earth = {
        date: mmddyyyy,
        temp_avg: `${randomDay.temp.day} °C`, // <---
        temp_min: `${randomDay.temp.min} °C`, // <---
        temp_max: `${randomDay.temp.max} °C`, // <---
        pressure: `${randomDay.pressure * 100} Pa`, // convert hPa to Pa
        wind_speed: `${randomDay.wind_speed} m/s`, // <---
        humidity: `${randomDay.humidity} %`,
      };

      // console.log('### EARTH DATA ###');
      // console.log(res.locals.weatherData.earth);
      return next();
    } catch (err) {
      return next({
        log: `fetchEarthData Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred inside fetchEarthData' },
      });
    }
  },
  // https://api.nasa.gov/insight_weather/?api_key=4Ft01vTgsi4Gp07fqeIlcrjaGJ0AO3fz1KHQaL8m
  // https://api.nasa.gov/insight_weather/?api_key=4Ft01vTgsi4Gp07fqeIlcrjaGJ0AO3fz1KHQaL8m&feedtype=json&ver=1.0

  // Fetch Mars Weather Data
  fetchMarsData: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    /* !!! 
    1/ Implement logic where we look up the data inside our database
    - If we can find it, retrieve form the data base.
    - If we canNOT find it, run the fetch call and SAVE the data as to avoid repeated DB fetches.

    2/ Let the user select the SOL -> 
    - 675, 676, 677, 678, 679, 680, 681
    */

    const FINAL_URL = `${NASA_URL}&feedtype=json&ver=1.0`;
    // console.log('### MARS URL ###');
    // console.log(FINAL_URL);

    try {
      const response = await fetch(FINAL_URL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      const sols = data.sol_keys;

      /* Fetch daata for each SOL
      1/ Loop through each sol
      2/ Look up the desired data for each sol
      3/ Store the desired data for each sol
      */
      if (!res.locals.weatherData) res.locals.weatherData = {};
      res.locals.weatherData.mars = [];

      for (const sol of sols) {
        const solData = data[sol];
        res.locals.weatherData.mars.push({
          sol: sol,
          temp_avg: `${solData.AT.av} °C`, // Degrees Celsius
          temp_min: `${solData.AT.mn} °C`, // Degrees Celsius
          temp_max: `${solData.AT.mx} °C`, // Degrees Celsius
          pressure: `${solData.PRE.av} Pa`, // Pascals
          wind_speed: `${solData.HWS.av} m/s`, // meters / sec
        });
      }
      // console.log('### MARS DATA ###');
      // console.log(res.locals.weatherData.mars);

      /* DATA CATALOG: https://api.nasa.gov/assets/insight/InSight%20Weather%20API%20Documentation.pdf
        "675": {
          "AT": {
            "av": -62.314, <---
            "ct": 177556,
            "mn": -96.872, <---
            "mx": -15.908 <---
          },
          "First_UTC": "2020-10-19T18:32:20Z", <---
          "HWS": {
            "av": 7.233, <---
          },
          "Last_UTC": "2020-10-20T19:11:55Z",
          "Month_ordinal": 10,
          "Northern_season": "early winter",
          "PRE": {
            "av": 750.563, <---
          },
          "Season": "fall",
          "Southern_season": "early summer",
        },
   */

      return next();
    } catch (err) {
      return next({
        log: `fetchMarsData Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred inside fetchMarsData' },
      });
    }
  },

  // URL: https://api.nasa.gov/planetary/earth/imagery?lat=36.098592&lon=-112.097796&date=2020-01-01&cloud_score=true&dim=0.3&api_key=4Ft01vTgsi4Gp07fqeIlcrjaGJ0AO3fz1KHQaL8m
  fetchImageOfEarthLocation: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // !!! Make date dynamic
      const { lat, lon } = req.query;
      const FINAL_URL = `https://api.nasa.gov/planetary/earth/imagery?lat=${lat}&lon=${lon}&date=2024-01-01&cloud_score=true&dim=0.3&api_key=${NASA_API_KEY}`;
      // console.log('### IMAGE OF EARTH ###');
      // console.log(FINAL_URL);

      // !!! THIS API CALL RETURNS AN IMAGE, NOT DATA
      const response = await fetch(FINAL_URL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const data = await response.json();

      if (!res.locals.weatherData) res.locals.weatherData = {};
      res.locals.weatherData.earth.randomImage = data;

      return next();
    } catch (err) {
      return next({
        log: `fetchImageOfEarthLocation data Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred' },
      });
    }
  },

  // Fetch Picture Of The Day
  fetchPod: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
      // get today's data in the following format: "2025-05-01"
      let today: any = new Date();
      const dd = String(today.getDate()).padStart(2, '0'); //
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = String(today.getFullYear());

      // "2025-05-01"
      // today = yyyy + '-' + mm + '-' + dd;
      today = yyyy.concat('-', mm, '-', dd);
      console.log(today);
      const podExists = await model.Pod.findOne({ date: today });

      let response;
      if (!podExists) {
        console.log(`Picture for today's date: ${today}, doesn't exist.`);
        response = await fetch(NASA_POD_URL);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const data = await response!.json();
        const newPod = await model.Pod.create(data);
        newPod.save();
        res.locals.pod = newPod;
        return next();
      }

      console.log(`Pod exist for today's date: ${today}, it's:`, podExists);
      res.locals.pod = podExists;
      return next();
    } catch (err) {
      return next({
        log: `fetchPod data Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred' },
      });
    }
  },

  fetchRandomPics: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sol = 3996;
      const RANDOM_PICS_URL = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
      const response = await fetch(RANDOM_PICS_URL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const data = await response.json();
      const photos = data.photos;

      if (!res.locals.randomMarsPics) res.locals.randomMarsPics = [];

      // Define number of images you want to pass to the frontend
      let numberOfPhotos: number = 99;

      for (let i = 0; i < numberOfPhotos; i++) {
        const currPhoto = photos[i];

        res.locals.randomMarsPics.push({
          nasa_id: currPhoto.id,
          sol: currPhoto.sol,
          img_src: currPhoto.img_src,
          earth_date: currPhoto.earth_date,
        });
      }

      // console.log(res.locals.randomMarsPics);
      return next();
    } catch (err) {
      return next({
        log: `fetchRandomPics data Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred' },
      });
    }
  },

  getResponse: async (
    req: Request,
    res: Response,
    next: NextFunction,
    client: OpenAI
  ): Promise<void> => {
    try {
      const prompterino = req.body.message;
      // console.log('Prompt sent to OpenAI:', prompt); // Log the prompt
      const response = await promptOpenAI(prompterino, client);
      // console.log(response);
      // console.log('OpenAI response:', response); // Log the OpenAI response

      /*
      X -> const podExists = await model.Pod.findOne({ date: today });
      X -> const data = await response!.json();
      
      const newPod = await model.Pod.create(data);
      
      newPod.save();
      res.locals.pod = newPod;
      */
      const newMessage = await model.Chat.create({
        message: response,
        prompt: prompterino,
      });
      newMessage.save();
      res.locals.response = response;

      // find() <--- this will return you ALL values
      // console.log(model.Chat.find()); // <--- Find all messages from Chat and console log them
      return next();
    } catch (err) {
      // console.error('Error in getResponse:', err); // Log the error
      return next({
        log: `getResponse data Error: ${err}`,
        status: 500,
        message: { error: 'An error occurred' },
      });
    }
  },
};

export default apiController;
