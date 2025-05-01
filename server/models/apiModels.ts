import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI: string | undefined = process.env.MONGO_URI;
const Schema = mongoose.Schema;

// 5 schemas
// Mars Schema
const marsWeatherSchema = new Schema({
  sol: Number,
  temp_avg: String,
  temp_min: String,
  temp_max: String,
  pressure: String,
  wind_speed: String,
});
const Mars = mongoose.model('mars', marsWeatherSchema, 'mars');

// Earth Schema
const earthWeatherSchema = new Schema({
  date: Number,
  temp_avg: String,
  temp_min: String,
  temp_max: String,
  pressure: String,
  wind_speed: String,
  humidity: String,
});
const Earth = mongoose.model('earth', earthWeatherSchema, 'earth');

// // comparison data
// // const comparisonDataSchema = mongoose.model('')
// const comparisonDataSchema = new Schema({
//   date: Number,
//   temp_avg: String,
//   temp_min: String,
//   temp_max: String,
//   pressure: String,
//   wind_speed: String,
//   humidity: String,
// });
// const ComparisonSchema = mongoose.model(
//   'compData',
//   comparisonDataSchema,
//   'compDatas'
// );

// chat data
const chatSchema = new Schema({
  message: String,
  response: String,
});

const Chat = mongoose.model('chat', chatSchema, 'chat');

//randomPics schema
const randomPicsSchema = new Schema({
  nasa_id: String,
  sol: Number,
  img_src: String,
  earth_date: String,
});
const RandomPics = mongoose.model('randomPic', randomPicsSchema, 'randomPics');

//pod schema
const podSchema = new Schema({
  date: String,
  explanation: String,
  hdurl: String,
  service_version: String,
  media_type: String,
  title: String,
  url: String,
});
const Pod = mongoose.model('podSchema', podSchema, 'podSchema');

const model = {
  Earth,
  Mars,
  RandomPics,
  Chat,
  Pod,
};

export default model;

// https://mongoosejs.com/docs/typescript.html
async function openConnection() {
  if (!MONGO_URI) throw new Error('Mongo_URI is not defined');

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'Mars',
    });

    console.log('Connected to the MongoDB.');
  } catch (err) {
    console.error(`Cannot connect to the MongoDB database. ${err}`);
  }
}

openConnection();

