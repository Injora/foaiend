const https = require('https');

https.get('https://api.allorigins.win/get?url=http://api.open-notify.org/iss-now.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(0, 200));
  });
});
