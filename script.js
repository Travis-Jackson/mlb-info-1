// select main div
const teamDiv = document.getElementById("teams");
// input
const season = document.getElementById("season");
// contains input and get teams and reset buttons
const buttonDiv = document.getElementById("buttons");
// get teams
const button = document.createElement("button");

const reset = document.createElement("button");

button.innerText = "Get Teams";
reset.innerText = "Reset";

buttonDiv.appendChild(button);
buttonDiv.appendChild(reset);

// search history array
const history = [];

// history heading
const historyHeading = document.createElement("h3");
historyHeading.innerText = "Search History:";
buttonDiv.appendChild(historyHeading);
// history paragraph
const historyPara = document.createElement("p");
buttonDiv.appendChild(historyPara);

button.addEventListener("click", () => {
  if (season.value === "") {
    alert("Please Enter a Valid Year!");
  }

  let yearPre;
  let year;

  if (history.length !== 0) {
    // isolate year
    yearPre = history[history.length - 1].split(">")[1];
    year = yearPre.split("<")[0];
  }
  // check if the same year is being searched repeatedly
  if (
    year !== season.value ||
    document.getElementsByClassName("team").length === 0
  ) {
    getTeamData(showList, season.value);

    // add to search history
    if (history[history.length - 1] !== `<a href="#">${season.value}</a>`) {
      history.push(`<a href="#">${season.value}</a>`);
      console.log(history);
      historyPara.innerHTML = history;
    }

    const aTags = document.getElementsByTagName("a");
    for (let i = 0; i < aTags.length; i++) {
      aTags[i].addEventListener("click", () => {
        const yearPre = history[i].split(">")[1];
        const year = yearPre.split("<")[0];

        season.value = year;
        button.click();
      });
    }
  }
});

reset.addEventListener("click", () => {
  while (teamDiv.hasChildNodes()) {
    teamDiv.removeChild(teamDiv.firstChild);
  }
});

// creates elements and displays them
function showList(array) {
  for (let i = 0; i < array.length; i++) {
    const teamDataDiv = document.createElement("div");
    teamDataDiv.setAttribute("class", "team");
    teamDataDiv.setAttribute("id", "MLB-" + array[i]["team_id"]);
    teamDiv.appendChild(teamDataDiv);

    const hrElem = document.createElement("hr");
    const teamName = document.createElement("h4");
    const teamVenue = document.createElement("p");

    teamName.innerText = array[i]["name_display_full"];
    teamVenue.innerText = "Venue: " + array[i]["venue_name"];

    teamDataDiv.appendChild(teamName);
    teamDataDiv.appendChild(teamVenue);

    const showRosterButton = document.createElement("button");
    showRosterButton.setAttribute("id", "btn-" + array[i]["team_id"]);
    showRosterButton.innerText = "Show Roster";
    teamDataDiv.appendChild(showRosterButton);

    // add event listener to each new div
    showRosterButton.addEventListener("click", () => {
      const teamId = teamDataDiv.id.split("-")[1];
      // prevent more than one click
      showRosterButton.disabled = true;
      
      // prevent more than one roster table
      if (document.getElementById(teamDataDiv.id + "-table") !== null) {
        return;
      } 

      getRosterData(showRoster, season.value, teamId, teamDataDiv.id);
     
    });
    
    if (i !== array.length - 1) {
      teamDataDiv.appendChild(hrElem);
    }
  }
}

// makes an AJAX call to the api, then calls showList()
async function getTeamData(passedFunc, year) {
  const url = `https://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_code='mlb'&all_star_sw='N'&sort_order=name_asc&season=${year}`;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  const results = data["team_all_season"]["queryResults"]["row"];
  console.log(results);

  if (results === undefined) {
    alert("Year Not Available!");
  }

  if (results.length > 0) {
    reset.click();
  }

  passedFunc(results);
}

function showRoster(array, divId) {

  const parentDiv = document.getElementById(divId);
  
  const rosterTable = document.createElement("table");
  rosterTable.setAttribute("id", divId + "-table");
                           
  parentDiv.appendChild(rosterTable);

  const hbDiv = document.createElement("div");
  hbDiv.setAttribute("class", "hide");
  rosterTable.appendChild(hbDiv);

  const hideTableButton = document.createElement("button");
  hideTableButton.setAttribute("class", "hideBtn");
  hideTableButton.innerText = "Hide Table";

  hbDiv.appendChild(hideTableButton);

  hideTableButton.addEventListener("click", () => {
    while (rosterTable.hasChildNodes()) {
      rosterTable.removeChild(rosterTable.firstChild);
    }

    rosterTable.remove();  
    // re-enable button
    document.getElementById("btn-" + divId.split("-")[1]).disabled = false;
  });

  const tableHeaderRow = document.createElement("tr");
  rosterTable.appendChild(tableHeaderRow);

  const numberHeader = document.createElement("th");
  numberHeader.innerText = "Number";

  const nameHeader = document.createElement("th");
  nameHeader.innerText = "Name";

  const positionHeader = document.createElement("th");
  positionHeader.innerText = "Position";

  tableHeaderRow.appendChild(numberHeader);
  tableHeaderRow.appendChild(nameHeader);
  tableHeaderRow.appendChild(positionHeader);

  for (let i = 0; i < array.length; i++) {
    const playerRow = document.createElement("tr");
    rosterTable.appendChild(playerRow);

    const numberTd = document.createElement("td");
    numberTd.innerText = array[i]["jersey_number"];

    const nameTd = document.createElement("td");
    nameTd.innerText = array[i]["name_first_last"];

    const positionTd = document.createElement("td");
    positionTd.innerText = array[i]["position_desig"];

    playerRow.appendChild(numberTd);
    playerRow.appendChild(nameTd);
    playerRow.appendChild(positionTd);
  }
}

async function getRosterData(passedFunc, year, teamId, divId) {
  const url = `https://lookup-service-prod.mlb.com/json/named.roster_team_alltime.bam?start_season=${year}&end_season=${year}&team_id=${teamId}`;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  const results = data["roster_team_alltime"]["queryResults"]["row"]; 
 
  if (results === undefined) {
    alert("Roster Not Available!");
  }
  
  passedFunc(results, divId);
}

// new stuff!!
