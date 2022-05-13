// select main div
const teamDiv = document.getElementById("teams");
// input
const season = document.getElementById("season");
// contains input and get teams and reset buttons
const buttonDiv = document.getElementById("buttons");
// get teams
const button = document.createElement("button");
button.setAttribute("class", "main-btn");

const reset = document.createElement("button");
reset.setAttribute("class", "main-btn");

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
    document.getElementsByClassName("team").length === 0 ||
    season.value !== ""
  ) {
    if (
      !isNaN(Number(season.value)) &&
      Number(season.value) >= 1876 &&
      Number(season.value) <= new Date().getFullYear()
    ) {
      getTeamData(showList, season.value);
    } else {
      yearPre = history[history.length - 1].split(">")[1];
      year = yearPre.split("<")[0];
      season.value = year;
      button.click();
      alert("Please Enter a Valid Year!");
    }
    // add to search history
    if (
      history[history.length - 1] !== `<a href="#">${season.value}</a>` &&
      season.value !== "" &&
      !isNaN(Number(season.value))
    ) {
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

// add event listener to press get teams button when the user presses enter
season.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    button.click();
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
    teamName.setAttribute("class", "team-name");

    const teamVenue = document.createElement("p");

    const teamLeague = document.createElement("p");
    const teamFirstPlayed = document.createElement("p");

    teamName.innerText = array[i]["name_display_full"];
    teamVenue.innerText = "Venue: " + array[i]["venue_name"];
    teamLeague.innerText = "League: " + array[i]["league"];
    teamFirstPlayed.innerText =
      "First Year Played: " + array[i]["first_year_of_play"];

    teamDataDiv.appendChild(teamName);
    teamDataDiv.appendChild(teamVenue);
    teamDataDiv.appendChild(teamLeague);
    teamDataDiv.appendChild(teamFirstPlayed);

    const showRosterButton = document.createElement("button");
    showRosterButton.setAttribute("id", "btn-" + array[i]["team_id"]);
    showRosterButton.setAttribute("class", "roster-btn");
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

  const hbDiv = document.createElement("div");
  hbDiv.setAttribute("class", "hide");
  parentDiv.appendChild(hbDiv);

  const rosterTable = document.createElement("table");
  rosterTable.setAttribute("id", divId + "-table");

  parentDiv.appendChild(rosterTable);

  const hideTableButton = document.createElement("button");
  hideTableButton.setAttribute("class", "hideBtn");
  hideTableButton.innerText = "Hide Table";

  hbDiv.appendChild(hideTableButton);

  hideTableButton.addEventListener("click", () => {
    while (rosterTable.hasChildNodes()) {
      rosterTable.removeChild(rosterTable.firstChild);
    }

    rosterTable.remove();
    hideTableButton.remove();
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
    positionTd.innerText =
      array[i]["position_desig"].charAt(0) +
      array[i]["position_desig"].substring(1).toLowerCase();

    const buttonTd = document.createElement("td");
    const icon = document.createElement("i");
    icon.setAttribute("class", "fa-solid fa-info");
    buttonTd.appendChild(icon);

    // select button that opens modal
    const playerInfoButton = document.getElementById("modal-btn");
    // add event listener to the icon to open the modal
    icon.addEventListener("click", () => {
      getPlayerInfo(array[i]["player_id"]);
      playerInfoButton.click();
    });

    playerRow.appendChild(numberTd);
    playerRow.appendChild(nameTd);
    playerRow.appendChild(positionTd);
    playerRow.appendChild(buttonTd);
  }
}

async function getRosterData(passedFunc, year, teamId, divId) {
  const url = `https://lookup-service-prod.mlb.com/json/named.roster_team_alltime.bam?start_season=${year}&end_season=${year}&team_id=${teamId}`;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  const results = data["roster_team_alltime"]["queryResults"]["row"];

  console.log(results);

  if (results === undefined) {
    alert("Roster Not Available!");
  }
  
  passedFunc(results, divId);
}

// make AJAX call and create a paragraph filled with player info, then diplay in modal
async function getPlayerInfo(playerId) {

  // select modal body
  const modalBody = document.getElementsByClassName("modal-body")[0];
  
  while (modalBody.hasChildNodes()) {
    modalBody.removeChild(modalBody.firstChild);
  }

  const url = `https://lookup-service-prod.mlb.com/json/named.player_info.bam?sport_code='mlb'&player_id=${playerId}`;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  const player = data["player_info"]["queryResults"]["row"];

  console.log(player);


  let playerNum = player["jersey_number"];
  if (playerNum !== "") {
    playerNum = "<span class='bold'>#" + playerNum + "</span>";
  }

  // set title to player name
  const playerName = document.getElementById("exampleModalLabel");
  playerName.innerHTML =
    player["name_display_first_last"] + "&emsp;&emsp;&emsp;" + playerNum;

  // create paragraph
  const paragraph = document.createElement("p");

  // use span tags to set css to bold
  paragraph.innerHTML =
    "<span class='bold'>Last/Current Team: </span>" +
    player["team_name"] +
    "<br/><span class='bold'>Country:</span> " +
    player["birth_country"] +
    " <span class='bold'>Birth Date:</span> " +
    player["birth_date"].split("T")[0] +
    "<br/><span class='bold'>Throws:</span> " +
    player["throws"] +
    " <span class='bold'>Bats:</span> " +
    player["bats"] +
    "<br/><span class='bold'>Pro Debut:</span> " +
    player["pro_debut_date"].split("T")[0];

  modalBody.appendChild(paragraph);
}

console.log(2022 == new Date().getFullYear());
