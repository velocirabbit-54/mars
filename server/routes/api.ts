import { Router, Request, Response, NextFunction } from 'express';
import apiController from '../controllers/apiController';
import type OpenAI from 'openai';

const apiRouter = (client: OpenAI) => {
  const router = Router();
  // 1. Fetch "Mars-Earth Comparison" data
  // Test URL format (for POSTMAN): http://localhost:3000/api/comparisonData?lat=33.44&lon=-94.04
  // Test URL format (for POSTMAN): /api/comparisonData?lat=33.44&lon=-94.04
  // TODO: Process the data and only send to the front-end what's necessary

  // Combination Data
  router.get(
    '/comparisonData',
    apiController.fetchEarthData,
    apiController.fetchMarsData,
    // apiController.fetchImageOfEarthLocation,
    (req: Request, res: Response) => {
      res.status(200).json(res.locals.weatherData);
    }
  );

    // Earth Data
  router.get(
    '/earthData',
    apiController.fetchEarthData,
    // apiController.fetchImageOfEarthLocation,
    (req: Request, res: Response) => {
      res.status(200).json({ earth: res.locals.weatherData?.earth});
    }
  );

  // Mars Data
  router.get(
    '/marsData',
    apiController.fetchMarsData,
    // apiController.fetchImageOfEarthLocation,
    (req: Request, res: Response) => {
      res.status(200).json({ mars: res.locals.weatherData?.mars});
    }
  );

  // 2. Fetch "Picture of the day" data
  router.get('/pod', apiController.fetchPod, (req: Request, res: Response) => {
    res.status(200).json(res.locals.pod);
  });

  // 3. TODO: Fetch "Random 6 Pictures" from Mars
  // (Optional) Dynamic variable - SOL
  // https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=4Ft01vTgsi4Gp07fqeIlcrjaGJ0AO3fz1KHQaL8m
  // https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2024-6-6&api_key=4Ft01vTgsi4Gp07fqeIlcrjaGJ0AO3fz1KHQaL8m
  // "Random Pokemon Cards" -> Reset / ...
  router.get(
    '/randomPics',
    apiController.fetchRandomPics,
    (req: Request, res: Response) => {
      // console.log(res.locals.randomMarsPics);
      res.status(200).json(res.locals.randomMarsPics);
    }
  );

  // // 4. TODO: Make an OpenAI API call to talk to the Martian
  // Save the data to the DB

  router.post(
    '/chat',
    (req: Request, res: Response, next: NextFunction) => {
      // console.log('Incoming request to /chat:', req.body); // Log the incoming request
      apiController.getResponse(req, res, next, client);
    },
    (req: Request, res: Response) => {
      // console.log('Response to be sent:', res.locals.response); // Log the response
      res.status(200).json({ response: res.locals.response });
    }
  );

  return router;
};

export default apiRouter;
