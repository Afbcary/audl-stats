let players = [];

const summaryPlayer = {
  pointsPlayedDefense: 0,
  pointsLostDefense: 0,
  pointsWonDefense: 0,
  pointsPlayedOffense: 0,
  pointsLostOffense: 0,
  pointsWonOffense: 0
};

// List of accumulatableStats property names
const accumulatableStats = ["gamesPlayed", "oppPossessionsPlayedDefense", "oppPossessionsPlayedOffense", "pointsLost", "pointsLostDefense", "pointsLostOffense", "pointsPlayed", "pointsPlayedDefense", "pointsPlayedOffense", "pointsWon", "pointsWonDefense", "pointsWonOffense", "possessionsPlayed", "possessionsPlayedDefense", "possessionsPlayedOffense", "quartersPlayed", "goals", "goalsOffense", "goalsDefense", "catches", "drops", "assists", "assistsOffense", "assistsDefense", "hockeyAssists", "hockeyAssistsOffense", "hockeyAssistsDefense", "throws", "completions", "throwaways", "throwsDropped", "throwsRecordedWithYardage", "foulsDrawn", "stalls", "blocks", "blocksOffense", "blocksDefense", "callahans", "pulls", "pullsOutofbounds", "pullsRecordedWithYardage", "pullsInboundsRecordedWithYardage", "throwingYards", "lateralThrowingYards", "forwardThrowingYards", "pullYards", "pullYardsInbounds"];

// Create Team Summary Objects
const teams = {};
const teamNames = ["Atlanta Hustle", "Austin Sol", "Chicago Wildfire", "DC Breeze", "Dallas Roughnecks", "Detroit Mechanix", "Indianapolis AlleyCats", "Los Angeles Aviators", "Madison Radicals", "Minnesota Wind Chill", "Montreal Royal", "Nashville NightWatch", "New York Empire", "Ottawa Outlaws", "Philadelphia Phoenix", "Pittsburgh Thunderbirds", "Raleigh Flyers", "San Diego Growlers", "San Francisco FlameThrowers", "San Jose Spiders", "Seattle Cascades", "Tampa Bay Cannons", "Toronto Rush"];

for (teamName of teamNames) {
  teams[teamName] = { name : teamName };
  for (accumulatableStat of accumulatableStats) {
    teams[teamName][accumulatableStat] = 0;
  }
}

stats.filter(r => r.year === 'AUDL 2018').forEach(r => {
  const player = new Object(r);
  player.defensiveEfficiency = player.pointsWonDefense / player.pointsPlayedDefense;
  player.offensiveEfficiency = player.pointsWonOffense / player.pointsPlayedOffense;
  players.push(player);

  for (accumulatableStat of accumulatableStats) {
    summaryPlayer[accumulatableStat] += player[accumulatableStat];
    teams[player.teamName][accumulatableStat] += player[accumulatableStat];
  }
});

players = players.sort((p1, p2) => (p1.pointsPlayed > p2.pointsPlayed)? 1 : -1);

  document.getElementById('defenseWon').innerText = `Players won ${summaryPlayer.pointsWonDefense/summaryPlayer.pointsPlayedDefense}% of the games they played on defense.`;
  document.getElementById('defenseLost').innerText = `Players lost ${summaryPlayer.pointsLostDefense/summaryPlayer.pointsPlayedDefense}% of the games they played on defense.`;

  document.getElementById('offenseWon').innerText = `Players won ${summaryPlayer.pointsWonOffense/summaryPlayer.pointsPlayedOffense}% of the games they played on offense.`;
  document.getElementById('offenseLost').innerText = `Players lost ${summaryPlayer.pointsLostOffense/summaryPlayer.pointsPlayedOffense}% of the games they played on offense.`;

// Games Played Bar Chart
var gamesPlayedCtx = document.getElementById('gamesPlayedCanvas').getContext('2d');

var myChart = new Chart(gamesPlayedCtx, {
  type: 'bar',
  data: {
    labels: players.map(p => p.name),
    datasets: [
      {
        label: 'Points Played',
        data: players.map(p => p.pointsPlayed),       
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    legend: { display: false },
    title: {
      display: true,
      text: `Games Played`
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ],
      xAxes: [
        {
          display: false //this will remove all the x-axis grid lines
        }
      ]
    }
  }
});

// Team Offensive Efficieny Bar Chart
let teamsArray = [];
for (teamName of teamNames) {
  teams[teamName].offensiveEfficiency = teams[teamName].pointsWonOffense / teams[teamName].pointsPlayedOffense;
  teams[teamName].defensiveEfficiency = teams[teamName].pointsWonDefense / teams[teamName].pointsPlayedDefense;
  teamsArray.push(teams[teamName]);
}

// Team Offensive Efficiencies

teamsArray = teamsArray.sort((t1, t2) => (t1.offensiveEfficiency > t2.offensiveEfficiency)? 1 : -1);

generateBarGraph('teamOffensiveEfficiency', teamsArray, 'Offensive Efficiency', 'name', 'offensiveEfficiency', `2018 Team Offensive Efficiencies`);

// Team Defensive Efficiencies

teamsArray = teamsArray.sort((t1, t2) => (t1.defensiveEfficiency > t2.defensiveEfficiency)? 1 : -1);

generateBarGraph('teamDefensiveEfficiency', teamsArray, 'Defensive Efficiency', 'name', 'defensiveEfficiency', `2018 Team Defensive Efficiencies`);

// playerDefensiveEfficiencyByTeam

const radicalsPlayersDefensiveEfficiency = players.filter(p => p.teamName === 'Madison Radicals').filter(p => p.pointsPlayedDefense >= 20).sort((p1, p2) => (p1.defensiveEfficiency > p2.defensiveEfficiency)? 1 : -1);

generateBarGraph('playerDefensiveEfficiencyByTeam', radicalsPlayersDefensiveEfficiency, 'Defensive Efficiency', 'name', 'defensiveEfficiency', `2018 Radical Players Defensive Efficiencies`);


// playerOffensiveEfficiencyByTeam

const radicalsPlayersOffensiveEfficiency = players.filter(p => p.teamName === 'Madison Radicals').filter(p => p.pointsPlayedOffense >= 20).sort((p1, p2) => (p1.offensiveEfficiency > p2.offensiveEfficiency)? 1 : -1);

generateBarGraph('playerOffensiveEfficiencyByTeam', radicalsPlayersOffensiveEfficiency, 'Offensive Efficiency', 'name', 'offensiveEfficiency', `2018 Radical Players Offensive Efficiencies`);

// GENERATE BAR GRAPH

function generateBarGraph(canvasName, sortedData, labelText, labelName, statName, title) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map(p => p[labelName]),
      datasets: [
        {
          label: labelText,
          data: sortedData.map(p => p[statName]),       
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      legend: { display: false },
      title: {
        display: true,
        text: title
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
}
