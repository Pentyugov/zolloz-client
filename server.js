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
app.use(express.static(__dirname + '/dist'));

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname+'/dist/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
