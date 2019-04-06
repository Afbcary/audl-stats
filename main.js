let players = [];

module.exports = generateForTeam;

// var sk = require("./node_modules/statkit/statkit.js");

// // Anscombe's quartet
// var x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
// var y = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68];

// var A = new Array(x.length*2);
// for (var i = 0; i < x.length; ++i) {
//   A[2*i] = 1;
//   A[2*i + 1] = x[i];
// }

// var b = sk.lstsq(x.length, 2, A, y);

// console.log("intercept =", b[0], "slope =", b[1]);

// Add team options to select 
const teamSelect = document.getElementById('teamSelect');


// Create Team Summary Objects
const teams = {};
for (teamName of teamNames) {

  const option = document.createElement('option');
  option.value = teamName;
  option.innerHTML = teamName;
  teamSelect.appendChild(option);

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

let teamPlayersOffensiveEfficiencyChart;
let teamPlayersDefensiveEfficiencyChart;
// teamPlayersOffensiveEfficiencyChart = generatePlayerOffensiveEfficienciesForTeam('Madison Radicals');
// teamPlayersDefensiveEfficiencyChart = generatePlayerDefensiveEfficienciesForTeam('Madison Radicals');

// playerDefensiveEfficiencyByTeam
function generatePlayerDefensiveEfficienciesForTeam(selectedTeamName) {
  console.log(teamPlayersDefensiveEfficiencyChart);
  if (teamPlayersDefensiveEfficiencyChart) {
    teamPlayersDefensiveEfficiencyChart.destroy();
  }

  const teamPlayersDefensiveEfficiency = players.filter(p => p.teamName === selectedTeamName).sort((p1, p2) => (p1.defensiveEfficiency > p2.defensiveEfficiency)? 1 : -1);
  
  teamPlayersDefensiveEfficiencyChart = generateScatterChart('playerDefensiveEfficiencyAndPointsPlayedByTeam', `2018 ${selectedTeamName} Defensive Efficiency and Points Played`, teamPlayersDefensiveEfficiency, 'pointsPlayedDefense', 'defensiveEfficiency');
}


// playerOffensiveEfficiencyByTeam
function generatePlayerOffensiveEfficienciesForTeam(selectedTeamName) {
  console.log(teamPlayersOffensiveEfficiencyChart);
  if (teamPlayersOffensiveEfficiencyChart) {
    teamPlayersOffensiveEfficiencyChart.destroy();
  }
  const teamPlayersOffensiveEfficiency = players.filter(p => p.teamName === selectedTeamName).sort((p1, p2) => (p1.offensiveEfficiency > p2.offensiveEfficiency)? 1 : -1);
  
  teamPlayersOffensiveEfficiencyChart = generateScatterChart('playerOffensiveEfficiencyAndPointsPlayedByTeam', `2018 ${selectedTeamName} Offensive Efficiency and Points Played`, teamPlayersOffensiveEfficiency, 'pointsPlayedOffense', 'offensiveEfficiency');
}

function generateForTeam(selectedTeamName) {
  generatePlayerOffensiveEfficienciesForTeam(selectedTeamName);
  generatePlayerDefensiveEfficienciesForTeam(selectedTeamName);
}

function hsl_col_perc(value, min, max) {
  // colors 70 -> 20 
  //       (30 -> 80)
  //        min-> max
  // example 5 ,1, 10
  const range = max - min; // 9
  const place = value - min; // 4
  const percent = place / range;
  const colorPercent = 70 - (percent * 100) / 2;
  console.log(colorPercent);
  return `hsl(243, 100%, ${colorPercent}%)`;
}

// GENERATE BAR GRAPH
function generateBarGraph(canvasName, sortedData, labelText, labelName, statName, title) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  let minValue = 0;
  let maxValue = 1;
  if (sortedData.length > 0){
    minValue = sortedData[0][statName];
    maxValue = sortedData[sortedData.length - 1][statName];
  }

  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map(p => p[labelName]),
      datasets: [
        {
          label: labelText,
          data: sortedData.map(p => p[statName]),
          backgroundColor: sortedData.map(p => hsl_col_perc(p[statName], minValue, maxValue)),
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
  return chart;
}

function createScatterPoint(datum, xStat, yStat) {
  return { x: datum[xStat], y: datum[yStat]};
}

function generateScatterChart(canvasName, title, unorderedData, xStat, yStat) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  const scatterData = unorderedData.map(p => createScatterPoint(p, xStat, yStat));

  
  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: unorderedData.map(p => p.name),
        datasets: [{
            label: title,
            data: scatterData,
            backgroundColor: 'hsl(244, 100%, 50%)',
            pointRadius: 5
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                min: 0
            }],
            yAxes: [{
              ticks: {
                suggestedMin: 0,
                suggestedMax: 1
            }
          }]
        },
        tooltips: {
          callbacks: {
             label: function(tooltipItem, data) {
                var label = data.labels[tooltipItem.index];
                return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
             }
          }
       }
    }
  });
  return scatterChart;
}
