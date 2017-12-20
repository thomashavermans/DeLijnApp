

// zoals steeds "requiren" wat je wil gebruiken
var express = require("express");
var path = require("path");

// Daarna een Express app maken
var app = express();

// een datafile requiren

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express vertellen dat je views zich in een folder views bevinden
app.set("views", path.resolve(__dirname, "views"));

// Express vertellen dat je de EJS templating gaat gebruiken
// We moeten ejs ook installeren. Je doet dit via npm install ejs --save
app.set("view engine", "ejs");

app.get('/', function(req, res) {
  res.render('index', {
  });
});

app.get('/zoekhaltes', function(req, res) {
  res.render('zoekhaltesindebuurt', {
  });
});

app.get('/buyTicket', function(req, res) {
  res.render('buyTicket', {
  });
});

app.get('/info', function(req, res) {
  res.render('info', {
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
  });
});

app.get('/planRoute', function(req, res) {
  res.render('planRoute', {
  });
});

app.get('/recentLocation', function(req, res) {
  res.render('recentLocation', {
  });
});

app.get('/routeDetail', function(req, res) {
  res.render('routeDetail', {
  });
});

app.get('/recentStops', function(req, res) {
  res.render('recentStops', {
  });
});

// bij app.post hieronder willen we de gegevens van de form die de user heeft ingevuld gebruiken
// ik heb al mijn console.log er mee in laten staan zodat het stap voor stap duidelijk is wat er gebeurt en van waar de data komt
app.post('/haltesindebuurt', function(req, res) {
      var request = require('request');

      // vooraleer we onze opgevraagde coordinaten in de 'url api' kunnen plaatsen moeten we deze eerst omzetten, waarom
      // deze in x en y coordinaten zijn weet ik niet. Delijn beschikt wel degelijk over een algoritme alleen was deze wel wat moeilijk
      // te vinden aangezien deze niet bij de API documentatie stond, ook niet bij die nutteloze blog, daar staat trouwens de verkeerde link. Enkel de link hieronder werkt.

      // in de url naast request gaan we onze coordinaten van de user gebruiken, zie "req.body.lat" & "req.body.long" om deze te 'converten' naar de x en y coordinaten
      // die we nodig hebben voor het ophalen van onze data.
      request('https://www.delijn.be/rise-api-core/coordinaten/convert/' + req.body.lat + '/' + req.body.long + '', function (error, response, body) {
        // console.log(body);

        // Data die we opvragen "parsen naar json" zodat we deze kunnen aanspreken, anders kreeg ik steeds de foutmelding van undefined.
        var pak = JSON.parse(body);

        // variabele voor de 'geconverte' x coordinaten
        var xCoordinaat = pak.xCoordinaat;
        // console.log("x coordinaat = " + xCoordinaat);
        // variabele voor de 'geconverte' y coordinaten
        var yCoordinaat = pak.yCoordinaat;
        // console.log("y coordinaat = " + yCoordinaat);

        // aangemaakte variabele in met functie meegeven zodat we deze sebiet kunnen gebruiken om data op te halen via de API
        functioné(xCoordinaat, yCoordinaat)
      });

      // variabele om onze aangemaakte data terug naar ejs file te kunnen sturen, in ons geval de haltesindebuurt.ejs file
      var info = '';

      // functie om de haltes in de buurt van de user te vinden
      function functioné(xCoordinaat, yCoordinaat) {
        // eerst gaan we de coordinaten die we hebben geconvert in de url zetten om de api/data op te vragen, 'req.body.radius' is voor de ingevulde radius in m mee te geven aan de link
        request('https://www.delijn.be/rise-api-core/haltes/indebuurt/' + xCoordinaat + '/' + yCoordinaat + '/' + req.body.radius +'', function (error, response, body) {
          // ook deze data gaan we 'parsen' zodat we deze kunnen "oproepen".
          var data = JSON.parse(body);
          // console.log(data);
          // met deze console.log hebben we duidelijk overzicht over wat we terug krijgen uit de link

          // als we geen if else zouden gebruiken zou app vastlopen omdat er soms lege arrays bij zitten.
          // volgende if else zou logisch moeten zijn
          if (data === null) {
            info += `
            <p> Er zijn geen haltes gevonden binnen de opgegeven radius </p>
            `;
          }
          // indien er dus wel haltes gevonden zijn gaan we deze functie hieronder uitvoeren
          else {
            // alvast een map plaatsen voor onze bus/tramstops op aan te kunnen duiden
            info += `
              <div id="map" style="width: 100%; height: 400px;"></div>
            `;

            // we maken alvast een array aan om de nog aan te maken markers in te stoppen
            var markersMother = [];

            // loop aanmaken om alle data apart te kunnen aanspreken, als we dat niet doen krijgen we anders enkel het eerste item van de array te zien
            for (var i = 0; i < data.length; i++) {
              // simpelweg variable meegeven aan items om proces makkelijker te maken
              var o = data[i];
              // console.log(o);
              // nieuwe array aanmaken om opgevraagde markers in te steken
              var markers = [];
              // om deze dan naar de "hoofarray" te sturen
              markersMother.push(markers)

              // de "lijnenarray" is een array uit de api zelf en deze zit zeg maar diep weg daarmee even variable meegeven om ook proces hier te vergemakkelijken
              var d = o.lijnen[0];
              // console.log(d);

              // ook hier if else doen omdat het zou kunnen dat er bij sommige "lijnendata" geen data terug te vinden is, als we
              // geen if else statement gebruiken zou applicatie weer vastlopen
              if (d !== undefined) {
                // hier geven we info mee om te displayeb in de ejs file
                info += `
                  <h3 class="halteTitel"> ${o.omschrijvingLang} </h3>
                  <p class="afstand">Op ${o.afstand}m </p>
                  <h5 class="haltePara"> Richting: ${o.bestemmingen} </h5>
                  <h5 class="halteNummer" style="text-align: center; width: 150px; padding: 6px 0; border-radius: 5px; background: ${o.lijnen[0].kleurAchterGrond} ; color: white; font-weight: 400"> ${o.lijnen[0].lijnNummer} </h5>
                  <a class="googleTekst" target="_blank" href='https://www.google.com/maps/search/?api=1&query=${o.coordinaat.lt},${o.coordinaat.ln}'> Toon locatie op Google Maps </a>
                  <hr class="lijn">
                `;
                // even wat extra gegevens meegeven voor nadien te kunnen gebruiken om markers aan te maken
                // belangrijkste hier zijn de "o.coordinaat.lt" & "o.coordinaat.ln" anders weten we niet waar we ze gaan moeten zetten
                markers.push(o.coordinaat.lt, o.coordinaat.ln, o.omschrijvingLang, o.bestemmingen, d.lijnNummer);
              }

              // indien er geen informatie is, dus geen gegevens in de array terug te vinden zijn dan zal de user te zien
              // krijgen dat er dus geen informatie beschikbaar is, logisch
              else {
                info += `
                  <h3> ${o.omschrijvingLang} </h3>
                  <p> Op ${o.afstand}m </p>
                  <h5> Voor deze lijn is nog geen informatie beschikbaar </h5>
                  <hr>
                `;
              }
            };

            // we willen nu ook markers op onze map krijgen zodat de user ook iets ziet buiten gewoon wat tekst
            var markerJSON = JSON.stringify(markersMother);
            // console.log(markerJSON);

            // alles wat hieronder staat is voor map met markers aan te maken, uitleg hierover is terug te bevinden
            // op site van google maps api
            info += `
              <script>
                var arr = ${markerJSON};
                console.log(arr)

                function initMap() {
                  var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 15,
                    center: new google.maps.LatLng(${req.body.lat}, ${req.body.long}),
                  });

                  var infowindow = new google.maps.InfoWindow();

                  for (i = 0; i < arr.length; i++) {
                    var marker = new google.maps.Marker({
                      position: new google.maps.LatLng(arr[i][0], arr[i][1]),
                      map: map
                    });

                    google.maps.event.addListener(marker, 'click', (function(marker, i) {
                      console.log(arr[i][2])
                      return function() {
                        infowindow.setContent('<h4>' + arr[i][2] + '</h4>' + '<h5> Lijn: ' + arr[i][4] + '</h5>' + 'Richting: ' + arr[i][3]);
                        infowindow.open(map, marker);
                      }
                    })(marker, i));
                 }
                }
              </script>
            `;
          }

          res.render('haltesindebuurt', {
            haltes: `${info}`,
          });
        });
      };
});


app.use(express.static('public'));

app.listen(8080);
