// import request from 'supertest';
// import app from '../server'; // import your app
// import nock from 'nock';

// describe('GET /api/comparisonData', () => {
//   it('should return Earth and Mars weather data', async () => {
//     const res = await request(app)
//       .get('/api/comparisonData?lat=35&lon=139')
//       .expect(200);

//     expect(res.body.earth).toBeDefined();
//     expect(res.body.mars).toBeDefined();
//   });
// });

// describe('GET /api/comparisonData', () => {
//   it('should not return Earth or Mars weather data', async () => {
//     const res = await request(app).get('/api/comparisonData').expect(500);

//     expect(res.body.earth).not.toBeDefined();
//     expect(res.body.mars).not.toBeDefined();
//   });
// });

// describe('GET /api/comparisonData', () => {
//   xit('should not return Earth but return Mars weather data', async () => {
//     // Mock the Earth API to return an error
//     nock('https://earth-weather-api.com').get('/weather').reply(500);

//     // Mock the Mars API to return valid data
//     nock('https://mars-weather-api.com')
//       .get('/weather')
//       .reply(200, { temperature: -60 });

//     const res = await request(app)
//       .get('/api/comparisonData?lat=35&lon=139')
//       .expect(200);

//     expect(res.body.earth).not.toBeDefined(); // Earth data should be missing
//     expect(res.body.mars).toBeDefined(); // Mars data should be present
//     expect(res.body.mars.temperature).toBe(-60); // Validate Mars data
//   });
// });

// describe('GET /api/comparisonData', () => {
//   xit('should return Earth but not return Mars weather data', async () => {
//   // Mock the Earth API to return valid data
//    nock('https://earth-weather-api.com')
//    .get('/weather')
//    .reply(200, { temperature: 60 });

//    // Mock the Mars API to NOT return valid data
//    nock('https://mars-weather-api.com')
//    .get('/weather')
//    .reply(500);

//    const res = await request(app)
//       .get('/api/comparisonData?lat=35&lon=139')
//       .expect(200);

//       expect(res.body.mars).not.toBeDefined(); // Mars data should be missing
//       expect(res.body.earth).toBeDefined(); // Earth data should be present
//       expect(res.body.earth.temperature).toBe(60); // Validate Earth data
//       // Possibly need to make new function for earth and mars data respectively

//   });
// });

// describe('GET /api/marsData', () => {
//   it('should return Mars data', async () => {
    
//     nock('https://api.nasa.gov')
//    .get('/insight_weather/')
//    .query({ api_key: 'your_api_key', feedtype: 'json', ver: '1.0' })
//    .reply(200, { temperature: -60 });;

//    const res = await request(app)
//    .get('/api/marsData')
//    .expect(200);

//     expect(res.body.mars).toBeDefined();
//     expect(res.body.mars[0].temp_avg).toBe('-60 °C');
//   });
// });

// describe('GET /api/marsData', () => {
//   it('should not return Mars data', async () => {
    
//     nock('https://api.nasa.gov')
//     .get('/insight_weather/')
//     .query({})
//     .reply(500, {
//       sol_keys: ['675'],
//       '675': {
//         AT: { av: -60, mn: -80, mx: -20 },
//         PRE: { av: 750 },
//         HWS: { av: 5 }
//       }
//     });

//     const res = await request(app)
//       .get('/api/marsData')
//       .expect(500);

//     expect(res.body.mars).not.toBeDefined();
//   });
// });

// describe('GET /api/earthData', () => {
//   it('should return Earth data', async () => {
    
//     nock('https://api.openweathermap.org')
//     .get('/data/3.0/onecall')
//    .query({})
//    .reply(200, { temperature: '60 °C'});

//     const res = await request(app)
//       .get('/api/earthData?lat=35&lon=139')
//       .expect(200);

//     expect(res.body.earth).toBeDefined();
//     expect(res.body.earth.temp_avg).toBe('60 °C');
//   });
// });

// describe('GET /api/earthData', () => {
//   it('should not return Earth data', async () => {
    
//   .reply(200, {
//       daily: [
//         {
//           dt: 1745690400,
//           temp: { day: 60, min: 50, max: 70 },
//           pressure: 1018,
//           wind_speed: 3.5,
//           humidity: 40
//         }
//       ]
//     });
//     const res = await request(app)
//       .get('/api/earthData?lat=35&lon=139')
//       .query({})
//       .expect(500);

//     expect(res.body.earth).not.toBeDefined(); 
//   });
// });


// describe('GET /api/pod', () => {
//   it('should return picture of the day data', async () => {
//     const res = await request(app).get('/api/pod').expect(200);

//     expect(res.body).toBeDefined();
//     expect(['image', 'video']).toContain(res.body.media_type);
//   });
// });

// describe('GET /api/pod (invalid endpoint)', () => {
//   it('should return 404 for invalid route', async () => {
//     const res = await request(app)
//       .get('/api/podi') // invalid route
//       .expect(404); // this assumes you're using default express 404 handler

//     expect(res.body).toEqual({ error: 'Route not found' }); // or check for a custom error message if you send one
//   });
// });

// //This defines a test suite for the case when the NASA API fails (e.g. returns a 500 error).
// describe('GET /api/pod (NASA API error)', () => {
//   beforeEach(() => {
//     //•	nock('https://api.nasa.gov'): targets the domain you’re mocking (NASA API).
//     //•	.get('/planetary/apod'): intercepts a GET request to /planetary/apod.
//     //•	.query(true): allows any query string, like ?api_key=....
//     //•	.reply(500, { error: 'Internal NASA error' }): simulates a 500 Internal Server Error, and responds with a fake JSON error payload.
//     nock('https://api.nasa.gov')
//       .get('/planetary/apod')
//       .query(true)
//       .reply(500, { error: 'Internal Server Error' });
//   });
//   it('should handle NASA API failure', async () => {
//     const res = await request(app).get('/api/pod');

//     expect(res.status).toBeGreaterThanOrEqual(500);
//     expect(res.body).toHaveProperty('error');
//   });

//   afterEach(() => {
//     nock.cleanAll();
//   });
// });

// describe('GET /api/randomPics', () => {
//   it('should return random Mars pictures', async () => {
//     const res = await request(app).get('/api/randomPics').expect(200);

//     expect(res.body).toBeDefined();
//     expect(Array.isArray(res.body)).toBe(true);
//   });
// });

// describe('GET /api/randomPics (failure case)', () => {
//   beforeEach(() => {
//     // This should match the real NASA Mars Rover API endpoint
//     nock('https://api.nasa.gov')
//       .get('/mars-photos/api/v1/rovers/curiosity/photos')
//       .query(true)
//       .reply(500, { error: 'Internal Server Error' });
//   });

//   afterEach(() => {
//     nock.cleanAll();
//   });

//   it('should handle the failure gracefully', async () => {
//     const res = await request(app).get('/api/randomPics').expect(500);
//     expect(res.body).toBeDefined();
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toBe('An error occurred');
//   });
// });

// //404 and default error handling
// describe('Unknown Routes', () => {
//   it('should return 404 for unknown routes', async () => {
//     const res = await request(app).get('/unknown-route').expect(404);
//     expect(res.body).toHaveProperty('error', 'Route not found');
//   });
// });


import request from 'supertest';
import app from '../server';
// //👉 This imports the nock library, which is used to intercept and mock HTTP requests in your test environment.
import nock from 'nock';

describe('GET /api/comparisonData', () => {
  it('should return Earth and Mars weather data', async () => {
    nock('https://api.openweathermap.org')
      .get('/data/3.0/onecall')
      .query(true)
      .reply(200, {
        daily: [
          {
            dt: 1745690400,
            temp: { day: 60, min: 50, max: 70 },
            pressure: 1018,
            wind_speed: 3.5,
            humidity: 40,
          },
        ],
      });

    nock('https://api.nasa.gov')
      .get('/insight_weather/')
      .query(true)
      .reply(200, {
        sol_keys: ['675'],
        '675': {
          AT: { av: -60, mn: -80, mx: -20 },
          PRE: { av: 750 },
          HWS: { av: 5 },
        },
      });

    const res = await request(app)
      .get('/api/comparisonData?lat=35&lon=139')
      .expect(200);

    expect(res.body.earth).toBeDefined();
    expect(res.body.mars).toBeDefined();
    expect(res.body.mars[0].temp_avg).toBe('-60 °C');
  });

  it('should not return Earth or Mars weather data', async () => {
    const res = await request(app).get('/api/comparisonData').expect(500);
    expect(res.body.earth).not.toBeDefined();
    expect(res.body.mars).not.toBeDefined();
  });

  xit('should not return Earth but return Mars weather data', async () => {
    nock('https://api.openweathermap.org')
      .get('/data/3.0/onecall')
      .query(true)
      .reply(500);

    nock('https://api.nasa.gov')
      .get('/insight_weather/')
      .query(true)
      .reply(200, {
        sol_keys: ['675'],
        '675': {
          AT: { av: -60, mn: -80, mx: -20 },
          PRE: { av: 750 },
          HWS: { av: 5 },
        },
      });

    const res = await request(app)
      .get('/api/comparisonData?lat=35&lon=139')
      .expect(200);

    expect(res.body.earth).not.toBeDefined();
    expect(res.body.mars[0].temp_avg).toBe('-60 °C');
  });

  xit('should return Earth but not return Mars weather data', async () => {
    nock('https://api.openweathermap.org')
      .get('/data/3.0/onecall')
      .query(true)
      .reply(200, {
        daily: [
          {
            dt: 1745690400,
            temp: { day: 60, min: 50, max: 70 },
            pressure: 1018,
            wind_speed: 3.5,
            humidity: 40,
          },
        ],
      });

    nock('https://api.nasa.gov')
      .get('/insight_weather/')
      .query(true)
      .reply(500);

    const res = await request(app)
      .get('/api/comparisonData?lat=35&lon=139')
      .expect(500);

    expect(res.body.mars).not.toBeDefined();
    expect(res.body.earth.temp_avg).toBe('60 °C');
  });
});


describe('GET /api/marsData', () => {
  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect(); // Prevent real HTTP calls
    nock.enableNetConnect('127.0.0.1')
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should return Mars data', async () => {
    nock('https://api.nasa.gov')
      .get('/insight_weather/')
      .query(true)
      .reply(200, {
        sol_keys: ['675'],
        '675': {
          AT: { av: -60, mn: -80, mx: -20 },
          PRE: { av: 750 },
          HWS: { av: 5 },
        },
      });

    const res = await request(app).get('/api/marsData').expect(200);

    expect(res.body.mars).toBeDefined();
    expect(res.body.mars[0].temp_avg).toBe('-60 °C');
    expect(res.body.mars[0].temp_min).toBe('-80 °C');
    expect(res.body.mars[0].temp_max).toBe('-20 °C');
    expect(res.body.mars[0].pressure).toBe('750 Pa');
    expect(res.body.mars[0].wind_speed).toBe('5 m/s');
  });
});
  

//should not return Mars data
describe('GET /api/marsData', () => {
  it('should not return Mars data', async () => {
    nock('https://api.nasa.gov')
      .get('/insight_weather/')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const res = await request(app).get('/api/marsData').expect(500);

    expect(res.body.mars).not.toBeDefined();
  });
});



describe('GET /api/earthData', () => {
  it('should return Earth data', async () => {
    nock('https://api.openweathermap.org')
      .get('/data/3.0/onecall')
      .query(true)
      .reply(200, {
        daily: [
          {
            dt: 1745690400,
            temp: { day: 60, min: 50, max: 70 },
            pressure: 1018,
            wind_speed: 3.5,
            humidity: 40,
          },
        ],
      });

    const res = await request(app)
      .get('/api/earthData?lat=35&lon=139')
      .expect(200);

    expect(res.body.earth).toBeDefined();
    expect(res.body.earth.temp_avg).toBe('60 °C');
  });

  it('should not return Earth data', async () => {
    nock('https://api.openweathermap.org')
      .get('/data/3.0/onecall')
      .query(true)
      .reply(500);

    const res = await request(app)
      .get('/api/earthData?lat=35&lon=139')
      .expect(500);

    expect(res.body.earth).not.toBeDefined();
  });
});

describe('GET /api/pod', () => {
  it('should return picture of the day data', async () => {
    nock('https://api.nasa.gov')
      .get('/planetary/apod')
      .query(true)
      .reply(200, {
        title: 'Cool Mars Image',
        url: 'http://mars.com/image.jpg',
        media_type: 'image',
      });

    const res = await request(app).get('/api/pod').expect(200);
    expect(res.body).toBeDefined();
    expect(['image', 'video']).toContain(res.body.media_type);
  });

  it('should return 404 for invalid route', async () => {
    const res = await request(app).get('/api/podi').expect(404);
    expect(res.body).toEqual({ error: 'Route not found' });
  });

  it('should handle NASA API failure', async () => {
    nock('https://api.nasa.gov')
      .get('/planetary/apod')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const res = await request(app).get('/api/pod');
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/randomPics', () => {
  xit('should return random Mars pictures', async () => {
    nock('https://api.nasa.gov')
    .get('/mars-photos/api/v1/rovers/curiosity/photos')
    .query(true)
    .reply(200, {
      photos: [
        {
          id: 1,
          sol: 1000,
          img_src: 'http://mars.com/photo1.jpg',
          earth_date: '2020-01-01',
        },
      ],
    });

    const res = await request(app).get('/api/randomPics').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should handle the failure gracefully', async () => {
    nock('https://api.nasa.gov')
      .get('/mars-photos/api/v1/rovers/curiosity/photos')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const res = await request(app).get('/api/randomPics').expect(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('An error occurred');
  });
});

describe('Unknown Routes', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route').expect(404);
    expect(res.body).toHaveProperty('error', 'Route not found');
  });
});