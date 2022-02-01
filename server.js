// //Install express server
// const express = require('express');
// const path = require('path');
//
// const app = express();
//
// // Serve only the static files form the dist directory
// app.use(express.static('./dist/zolloz-client'));
//
// app.get('/*', (req, res) =>
//   res.sendFile('index.html', {root: 'dist/zolloz-client/'}),
// );
//
// // Start the app by listening on the default Heroku port
// app.listen(process.env.PORT || 4200, function(){
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });


//Install express server
const express = require('express');

const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./dist/zolloz-client'));

app.get('/*', (req, res) =>
  res.sendFile('index.html', {root: 'dist/zolloz-client/'}),
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);

// const wss = new Server({ server });
//
// wss.on('connection', (ws) => {
//   console.log('Client connected');
//   ws.on('close', () => console.log('Client disconnected'));
// });
//
// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);
