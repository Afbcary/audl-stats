var sk = require('./node_modules/statkit/statkit.js');

// TODO:
// draw linear reg lines to max x value
// title team bar graphs
// calculate team linear regressions
// calculate player standard deviations
// graph best player standard deviations on O and D
module.exports = generateForTeam;

// Add team options to select
const teamSelect = document.getElementById('teamSelect');

// Create Team Summary Objects
const teams = {};
for (teamName of teamNames) {
  const option = document.createElement('option');
  option.value = teamName;
  option.innerHTML = teamName;
  teamSelect.appendChild(option);

  teams[teamName] = { name: teamName, players: [] };
  for (accumulatableStat of accumulatableStats) {
    teams[teamName][accumulatableStat] = 0;
  }
}

const summaryPlayer = {};
for (accumulatableStat of accumulatableStats) {
  summaryPlayer[accumulatableStat] = 0;
}

let players = [];

individualStats
  .filter(r => r.year === 'AUDL 2018')
  .forEach(r => {
    const player = new Object(r);
    player.defensiveEfficiency =
      player.pointsPlayedDefense > 0
        ? player.pointsWonDefense / player.pointsPlayedDefense
        : 0;
    player.offensiveEfficiency =
      player.pointsPlayedOffense > 0
        ? player.pointsWonOffense / player.pointsPlayedOffense
        : 0;

    players.push(player);
    teams[player.teamName].players.push(player);

    for (accumulatableStat of accumulatableStats) {
      summaryPlayer[accumulatableStat] += player[accumulatableStat];
      teams[player.teamName][accumulatableStat] += player[accumulatableStat];
    }
  });

for (teamName of teamNames) {
  const offensiveTeamLinear = calculateLinearRegression(
    generateScatterData(
      teams[teamName].players,
      'pointsPlayedOffense',
      'offensiveEfficiency'
    )
  );
  const oTeamIntercept = offensiveTeamLinear[0];
  const oTeamSlope = offensiveTeamLinear[1];
  const defensiveTeamLinear = calculateLinearRegression(
    generateScatterData(
      teams[teamName].players,
      'pointsPlayedDefense',
      'defensiveEfficiency'
    )
  );
  const dTeamIntercept = defensiveTeamLinear[0];
  const dTeamSlope = defensiveTeamLinear[1];
}

const averageOffenseEfficiency = (
  (summaryPlayer.pointsWonOffense / summaryPlayer.pointsPlayedOffense) *
  100
)
  .toString()
  .substring(0, 5);
document.getElementById(
  'offenseWon'
).innerText = `Teams, on average, won ${averageOffenseEfficiency}% of their offensive points.`;

const averageDefensiveEfficiency = (
  (summaryPlayer.pointsWonDefense / summaryPlayer.pointsPlayedDefense) *
  100
)
  .toString()
  .substring(0, 5);
document.getElementById(
  'defenseWon'
).innerText = `Teams, on average, won ${averageDefensiveEfficiency}% of their defensive points.`;

// Generate Calculated Team Statistics
let teamsArray = [];
for (teamName of teamNames) {
  teams[teamName].offensiveEfficiency =
    teams[teamName].pointsWonOffense / teams[teamName].pointsPlayedOffense;
  teams[teamName].defensiveEfficiency =
    teams[teamName].pointsWonDefense / teams[teamName].pointsPlayedDefense;
  teamsArray.push(teams[teamName]);
}

// Team Offensive Efficiencies

teamsArray = teamsArray.sort((t1, t2) =>
  t1.offensiveEfficiency > t2.offensiveEfficiency ? 1 : -1
);

generateBarGraph(
  'teamOffensiveEfficiency',
  teamsArray,
  'Offensive Efficiency',
  'name',
  'offensiveEfficiency',
  `2018 Team Offensive Efficiencies`
);

// Team Defensive Efficiencies

teamsArray = teamsArray.sort((t1, t2) =>
  t1.defensiveEfficiency > t2.defensiveEfficiency ? 1 : -1
);

generateBarGraph(
  'teamDefensiveEfficiency',
  teamsArray,
  'Defensive Efficiency',
  'name',
  'defensiveEfficiency',
  `2018 Team Defensive Efficiencies`
);

let teamPlayersOffensiveEfficiencyChart;
let teamPlayersDefensiveEfficiencyChart;

// playerDefensiveEfficiencyByTeam
function generatePlayerDefensiveEfficienciesForTeam(selectedTeamName) {
  if (teamPlayersDefensiveEfficiencyChart) {
    teamPlayersDefensiveEfficiencyChart.destroy();
  }

  const teamPlayersDefensiveEfficiency = players
    .filter(p => p.teamName === selectedTeamName)
    .sort((p1, p2) =>
      p1.defensiveEfficiency > p2.defensiveEfficiency ? 1 : -1
    );

  teamPlayersDefensiveEfficiencyChart = generateScatterChart(
    'playerDefensiveEfficiencyAndPointsPlayedByTeam',
    `2018 ${selectedTeamName} Defensive Efficiency and Points Played`,
    teamPlayersDefensiveEfficiency,
    'pointsPlayedDefense',
    'defensiveEfficiency'
  );
}

// playerOffensiveEfficiencyByTeam
function generatePlayerOffensiveEfficienciesForTeam(selectedTeamName) {
  if (teamPlayersOffensiveEfficiencyChart) {
    teamPlayersOffensiveEfficiencyChart.destroy();
  }
  const teamPlayersOffensiveEfficiency = players
    .filter(p => p.teamName === selectedTeamName)
    .sort((p1, p2) =>
      p1.offensiveEfficiency > p2.offensiveEfficiency ? 1 : -1
    );

  teamPlayersOffensiveEfficiencyChart = generateScatterChart(
    'playerOffensiveEfficiencyAndPointsPlayedByTeam',
    `2018 ${selectedTeamName} Offensive Efficiency and Points Played`,
    teamPlayersOffensiveEfficiency,
    'pointsPlayedOffense',
    'offensiveEfficiency'
  );
}

function generateForTeam(selectedTeamName) {
  generatePlayerOffensiveEfficienciesForTeam(selectedTeamName);
  generatePlayerDefensiveEfficienciesForTeam(selectedTeamName);
}

function hsl_col_perc(value, min, max) {
  // colors 70 -> 20
  //       (30 -> 80)
  //        min-> max
  const range = max - min;
  const place = value - min;
  const percent = place / range;
  const colorPercent = 70 - (percent * 100) / 2;
  return `hsl(243, 100%, ${colorPercent}%)`;
}

// GENERATE BAR GRAPH
function generateBarGraph(
  canvasName,
  sortedData,
  labelText,
  labelName,
  statName,
  title
) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  let minValue = 0;
  let maxValue = 1;
  if (sortedData.length > 0) {
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
          backgroundColor: sortedData.map(p =>
            hsl_col_perc(p[statName], minValue, maxValue)
          ),
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

function generateScatterData(unorderedData, xStat, yStat) {
  const scatterData = [];
  for (point of unorderedData) {
    if (point[xStat] > 0) {
      scatterData.push({ x: point[xStat], y: point[yStat], name: point.name });
    }
  }
  return scatterData;
}

function generateLinePts(scatterData, maxX) {
  const linearRegression = calculateLinearRegression(scatterData);
  const intercept = linearRegression[0];
  const slope = linearRegression[1];
  const efficiencyAtMax = intercept + slope * maxX;
  const linePts = [{ x: 0, y: intercept }, { x: maxX, y: efficiencyAtMax }];
  if (efficiencyAtMax > 1) {
    linePts[1] = { x: (1 - intercept) / slope, y: 1 };
  } else if (efficiencyAtMax < 0) {
    linePts[1] = { x: (0 - intercept) / slope, y: 0 };
  }
  return linePts;
}

function generateScatterChart(canvasName, title, unorderedData, xStat, yStat) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  const scatterData = generateScatterData(unorderedData, xStat, yStat);

  let maxX = 300;
  for (point of unorderedData) {
    if (point[xStat] > maxX) {
      maxX = Math.ceil(point[xStat] / 50) * 50;
    }
  }
  const linePts = generateLinePts(scatterData, maxX);

  const labels = scatterData.map(p => p.name);
  // labels.unshift('line-end');
  // labels.unshift('line-intercept');

  var chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Players',
        type: 'scatter',
        backgroundColor: 'hsl(244, 100%, 50%)',
        pointRadius: 5,
        data: scatterData,
        showLine: false
      }
      ,
      {
        type: 'line',
        label: 'Linear Regression Line',
        data: linePts,
        fill: false,
        showLine: true,
        backgroundColor: 'hsl(150, 100%, 50%)',
        borderColor: 'hsl(150, 100%, 50%)'
      }
    ]
  };

  const options = {
    title: { display: true, text: title },
    scales: {
      xAxes: [
        {
          type: 'linear',
          position: 'bottom',
          scaleLabel: {
            display: true,
            labelString: 'Points Played'
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            suggestedMin: 0,
            suggestedMax: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'Efficiency'
          }
        }
      ]
    },
    tooltips: {
      intersect: false,
      callbacks: {
        title: function(tooltipItems, data) {
          if (tooltipItems[0].index < 2) {
            return "";
          }
          return data.labels[tooltipItems[0].index];
        },
        label: function(tooltipItem, data) {
          return `(${tooltipItem.xLabel}, ${tooltipItem.yLabel})`;
        }
      }
    }
  };

  var scatterChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
  });
  return scatterChart;
}

function calculateLinearRegression(scatterData) {
  var x = scatterData.map(d => d.x);
  var y = scatterData.map(d => d.y);

  var A = new Array(x.length * 2);
  for (var i = 0; i < x.length; ++i) {
    A[2 * i] = 1;
    A[2 * i + 1] = x[i];
  }
  return sk.lstsq(x.length, 2, A, y);
}
