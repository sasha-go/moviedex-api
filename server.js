require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./movies-data-small.json");

const app = express();
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

// Validate Token
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized Request" });
  }

  next();
});

// SERVER ERROR HANDLING
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

// MOVIE ROUTE AND FILTERS
app.get("/movie", function handleGetMovie(req, res) {
  let response = MOVIES;

  // GENRE FILTER
  if (req.query.genre) {
    response = response.filter((movie) => 
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }

  // COUNTRY FILTER
  if (req.query.country) {
    response = response.filter((movie) => {
      return movie.country.toLowerCase().includes(req.query.country.toLowerCase());
    });
  }

  // AVG VOTE FILTER
  if (req.query.avg_vote) {
    response = response.filter((movie) => {
      return Number(movie.avg_vote >= Number(req.query.avg_vote));
    });
  }

  res.json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
