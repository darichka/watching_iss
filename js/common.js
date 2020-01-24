/*
Function Craft is a constructor for creating new crafts. 
It takes only one parameter - the name of the ship.
*/
function Craft(name){
    this.name = name;
}

/*
Craft.prototype.setLocation determines current craft position and call functions to 
display received data in html. It takes three parameters: 
url - the link to the resource where craft position data is stored, 
latItemId - HMTL element ID where latitude of craft position will be output.
lngItemId - the same as latItemId, but for longitude.
Craft.prototype.setLocation use method fetch to make queries to server provided in url.
*/
Craft.prototype.setLocation = function(url, latItemId, lngItemId){
    let lat;
    let lng;
    fetch(url).then(response => response.ok?response.json():Promise.reject(response)).then(result => 
        {   lat = +result.iss_position.latitude;
            lng= +result.iss_position.longitude;
            writeCoordinate(lngItemId, lng);
            writeCoordinate(latItemId, lat);
            try{
                setLocationOnMap(lat, lng);
            }
            catch(e){
                alert("Sory, there are some issues with setting location on map \n" + e.name + " " + e.massage);
            }
        }).catch(err => alert("Sory, some issues happened during loading data with craft location \n" + err.name + ' ' +err.message));
}

/*
Function writeCoordinate puts coordinate into a HTML element with id = elemId.
 */
function writeCoordinate(elemId, coordinate){
    document.getElementById(elemId).innerHTML = coordinate;
}

/*
There is created function Craft.prototype.setAstronauts to get asronauts in space by fetch method.
Also this function calls another functions to determine which astronauts are on current craft and display 
resived data in html.
This function takes two parameters: 
url - the link to the resource where data about people in space is stored
astrElemId - the html element where astronauts will be written.
*/
Craft.prototype.setAstronauts = function(url, astrElemId){
    fetch(url).then(response => response.json()).then(result => 
        {
            let astronauts = findCraftAstronauts(this.name, result.people);
            let astrDiv = document.getElementById(astrElemId);
            outputAstronauts(astrDiv, astronauts);
        }).catch(err => alert("Sory, some issues happened during loading data with astronauts \n" + err.name + ' ' +err.message));
}
/*
Function findCraftAstronauts(craftName, people) determine who of people is on the current craft.
As a filter critria uses craftName.
*/
function findCraftAstronauts(craftName, people){
    let result = [];
    result = people.filter(function(astr){
        return astr.craft.toLowerCase() == craftName.toLowerCase();
    })
    return result = result.map(function(astr){
        return astr.name;
    });
}

/*
Function outputAstronauts writes the array of astronautes into astrDiv sub elements. 
These sub elements must satisfy qeurySelectors: "#astronauts-amount" and ".astronauts__list".
*/

function outputAstronauts(astrDiv, astrList){
    let total = astrDiv.querySelector("#astronauts-amount");
    if(total){
        total.innerHTML = astrList.length;
    }
    let ul = astrDiv.querySelector(".astronauts__list");
    if(ul){
        ul.innerHTML = "";
        for(let i = 0; i < astrList.length; i++){
            ul.append(createAstronaut(astrList[i]));
        }
    }
}

/*
    Function createAstronaut(astronautName) creates html element 'li' for astrounaut with name in param 'astronautName'
 */

function createAstronaut(astronautName){
    let astr = document.createElement('li');
    astr.className = 'astronaut';
    astr.innerHTML = astronautName;
    astr.prepend(createAstronautImg());
    return astr;
}

/*
    Function createAstronautImg() creates html element 'img'  - an avatar for astronauts in list.
 */

function createAstronautImg(){
    let astrImg = document.createElement('img');
    astrImg.src = 'img/avatar.png';
    astrImg.className = 'astr-img';
    return astrImg;
}

/*
Function writeCurrentDateTime(dateElem, timeElem) gets as a params(dateElem, timeElem)
HTML elements in which it'll output current date and time.  WriteCurrentDateTime() determine current time and date,
and pass this Date object to function parseDateTime(datetime). Function parseDateTime(datetime) separates date and time to different strings, 
and return them as characteristics of object rez.
*/

function parseDateTime(datetime){
    let rez = { }
    let datetimeStr = datetime.toUTCString();
    rez.date = datetimeStr.slice(0, 16);
    rez.time = datetimeStr.slice(16, 22);
    return rez;
}

function writeCurrentDateTime(dateElem, timeElem){
    let now = new Date();
    let utcParsed = parseDateTime(now);
    timeElem.innerHTML = utcParsed.time;
    dateElem.innerHTML = utcParsed.date;
}

/*
Next block of code works with map. Function initMap initialize map on the page.
Function addMarker defines and redefines marker on the map according to new ISS location.
Function setLocationOnMap sets map center according to new ISS location and call function addMarker to define marker's new position.
*/
var map;
var marker;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 3
    });
  }

function setLocationOnMap(lat, lng){
    let location = {lat: lat, lng: lng};
    map.setCenter(location);
    if(marker){
        marker.setMap(null);
    }
    addMarker(location);
}

function addMarker(location) {
    marker = new google.maps.Marker({
      position: location,
      map: map
    });
}

//-------------------------------
let iss = new Craft("ISS");
const LOCATION_URL = "http://api.open-notify.org/iss-now.json";
const ASTRONAUTS_URL = "http://api.open-notify.org/astros.json";
const LNG_ELEM_ID = "longitude";
const LAT_ELEM_ID = "latitude";
const ASTR_ELEM_ID = "astronauts";
const TIME_ELEM = document.getElementById('time');

function updateData(){
    iss.setLocation(LOCATION_URL, LAT_ELEM_ID, LNG_ELEM_ID);
    iss.setAstronauts(ASTRONAUTS_URL, ASTR_ELEM_ID);
    writeCurrentDateTime(TIME_ELEM.parentElement.nextElementSibling, TIME_ELEM);
}

try{
    initMap();
}
catch(e){
    alert("Sory, there some issues with map lodaing " + e.name + " " + e.massage);
}

try{
    updateData();;
}
catch(e){
    alert("Sory, there some issues during script execution \n"+ e.name + " " + e.massage);
}

let loop = setInterval(updateData, 5000);
