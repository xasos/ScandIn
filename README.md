# ScandIn

Let's say you are at a conference or a hackathon. ScandIn lets you take a picture with Google Glass, and then it sends the image to our Node.js backend, uses a face recognition algorithm on the image to find one of the users that is already in our database, and then returns basic information about that person based on their LinkedIn data. Glass app is available [here](https://github.com/xasos/ScandIn-Glass). Built at MHacks V.

## Running ScandIn

```sh
$ npm install
$ vim config/secrets.js  # Add your MongoDB URI + LinkedIn API Key
$ node app.js
```

## License
[MIT License](LICENSE)
