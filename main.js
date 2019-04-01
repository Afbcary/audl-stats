let players = [];


// Create Team Summary Objects
const teams = {};
for (teamName of teamNames) {
  teams[teamName] = { name : teamName };
  for (accumulatableStat of accumulatableStats) {
    teams[teamName][accumulatableStat] = 0;
  }
}

const summaryPlayer = {};
for (accumulatableStat of accumulatableStats) {
  summaryPlayer[accumulatableStat] = 0;
}

individualStats.filter(r => r.year === 'AUDL 2018').forEach(r => {
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

// Generate Calculated Team Statistics
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

function hsl_col_perc(percent) {
  const a = percent / 100,
    b = (120 - 0) * a,
    c = b + 0;

  // Return a CSS HSL string
  return 'hsl(' + c + ', 100%, 50%)';
}

// GENERATE BAR GRAPH
function generateBarGraph(canvasName, sortedData, labelText, labelName, statName, title) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  const minValue = sortedData[0][statName];
  const maxValue = sortedData[sortedData.length - 1][statName];
  const range = maxValue - minValue;

  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map(p => p[labelName]),
      datasets: [
        {
          label: labelText,
          data: sortedData.map(p => p[statName]),
          backgroundColor: sortedData.map(p => hsl_col_perc((p[statName] - minValue) * (100 / range))),
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
