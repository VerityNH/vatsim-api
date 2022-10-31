const fetch = require('node-fetch');

(async () => {
  const response = await fetch(
    'https://parseapi.back4app.com/classes/Aircraftmodels_ListOfAircraftModel?count=1',
    {
      headers: {
        'X-Parse-Application-Id': 'srzDHUaZFE7MgCc8ysyPXZFgHKBojqcbbwG6JQ8h', // This is your app's application id
        'X-Parse-REST-API-Key': 'xvHN9Z6N3ZGWvhpIhhVOb6sjnbuhKkbPY1g2OJNA', // This is your app's REST API key
      }
    }
  );
  const data = await response.json(); // Here you have the data that you need
  console.log(JSON.stringify(data, null, 2));
})();
