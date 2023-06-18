// tslint:disable:max-line-length
/* eslint-disable max-len */

import * as functions from "firebase-functions";
import * as express from "express";
import axios from "axios";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

// Initialize
const app = express();
dotenv.config();
admin.initializeApp();

// Check to see if there is a valid Firebase token
const validateFirebaseIdToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {
  // Is there an authorization header that begins with "bearer"?
  // Note that "bearer" is case-sensative. "Bearer" won't work
  if (!req.headers.authorization ||
    !req.headers.authorization.startsWith("bearer")) {
    res.status(403).send("Unauthorized: Missing header");
    return;
  }
  // Get the token from the header.
  let idToken;
  if (req.headers.authorization &&
    req.headers.authorization.startsWith("bearer")) {
    functions.logger.log("Found Authorization header");
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("bearer")[1].trim().replace(/^\s\n+|\s\n+$/g, "");
  } else {
    res.status(403).send("Unauthorized: Bad header");
    return;
  }
  // Try to verify token. Deny if invalid.
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log("ID Token correctly decoded", decodedIdToken);
    next();
    return;
  } catch (error) {
    functions.logger.error("Error while verifying Firebase ID token:", error);
    res.status(403).send(`Unauthorized: ${error}`);
    return;
  }
};

app.use(validateFirebaseIdToken);
app.use(express.json());

// Take the inital payload and forward to OpenAI.
// Recieve the response from OpenAI and send to user.
app.post("/", (req, res) => {
  const body = req.body;
  const url = "https://api.openai.com/v1/chat/completions";
  const API_KEY = process.env.API_KEY;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  };
  axios.post(url, body, {headers: headers})
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

exports.defaultOpenAIRequest = functions.https.onRequest(app);
