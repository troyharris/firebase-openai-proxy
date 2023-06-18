# firebase-openai-proxy

A simple Firebase cloud function proxy to verify authentication, and pass an OpenAI chat completion JSON object to OpenAI and recieve the response back. This is helpful for obscuring the OpenAI API key from the client code.

Note: The authentication header check is case-sensitive, and in this code requires the "bearer" keyword to be lowercase. Change as needed for your use-case.
