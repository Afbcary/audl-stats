var ss = require('spm-simple-statistics');

module.exports = generateForTeam;

// Add team options to select
const teamSelect = document.getElementById('teamSelect');
const defaultOption = document.createElement('option');
defaultOption.value = "";
defaultOption.innerHTML = "";
defaultOption.selected = true;
  teamSelect.appendChild(defaultOption);

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
  .filter(r => r.name.length > 5)
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
  teams[teamName].lrEquationOffense = calculateLinearRegression(
    generateScatterData(
      teams[teamName].players,
      'pointsPlayedOffense',
      'offensiveEfficiency'
    )
  );

  teams[teamName].lrEquationDefense = calculateLinearRegression(
    generateScatterData(
      teams[teamName].players,
      'pointsPlayedDefense',
      'defensiveEfficiency'
    )
  );
}

for (player of players) {
  player.errorOfPredictionOffense =
    player.offensiveEfficiency -
    teams[player.teamName].lrEquationOffense(player.pointsPlayedOffense);

  player.errorOfPredictionDefense =
    player.defensiveEfficiency -
    teams[player.teamName].lrEquationDefense(player.pointsPlayedDefense);
}

const averageOffenseEfficiency = (
  (summaryPlayer.pointsWonOffense / summaryPlayer.pointsPlayedOffense) *
  100
)
  .toFixed(4);

document.getElementById(
  'offenseWon'
).innerText = `League-wide, teams won ${averageOffenseEfficiency}% of their offensive points.`;

const averageDefensiveEfficiency = (
  (summaryPlayer.pointsWonDefense / summaryPlayer.pointsPlayedDefense) *
  100
)
.toFixed(4);

document.getElementById(
  'defenseWon'
).innerText = `League-wide, teams won ${averageDefensiveEfficiency}% of their defensive points.`;

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

// Error of prediction charts
let allPlayersOffensiveErrorOfPredictionChart;
let allPlayersDefensiveErrorOfPredictionChart;

const allPlayersOffensiveErrorOfPrediction = players
  .filter(p => p.errorOfPredictionOffense > 0)
  .sort((p1, p2) =>
    p1.errorOfPredictionOffense > p2.errorOfPredictionOffense ? 1 : -1
  );

allPlayersOffensiveErrorOfPredictionChart = generateScatterChart(
  'allPlayersOffensiveErrorOfPrediction',
  `2018 Players Offensive Error of Prediction`,
  allPlayersOffensiveErrorOfPrediction,
  'pointsPlayedOffense',
  'errorOfPredictionOffense'
);

const allPlayersDefensiveErrorOfPrediction = players
  .filter(p => p.errorOfPredictionDefense > 0)
  .sort((p1, p2) =>
    p1.errorOfPredictionDefense > p2.errorOfPredictionDefense ? 1 : -1
  );

allPlayersDefensiveErrorOfPredictionChart = generateScatterChart(
  'allPlayersDefensiveErrorOfPrediction',
  `2018 Players Defensive Error of Prediction`,
  allPlayersDefensiveErrorOfPrediction,
  'pointsPlayedDefense',
  'errorOfPredictionDefense'
);

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

  teamPlayersDefensiveEfficiencyChart = generateScatterChartWithLine(
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

  teamPlayersOffensiveEfficiencyChart = generateScatterChartWithLine(
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
            return data.labels[tooltipItems[0].index];
          },
          label: function(tooltipItem, data) {
            return `${tooltipItem.yLabel.toFixed(3)}`;
          }
        }
      }
    }
  });
  return chart;
}

function generateScatterData(unorderedData, xStat, yStat) {
  const scatterData = [];
  for (point of unorderedData) {
    if (point[xStat] > 0) {
      scatterData.push({
        x: point[xStat],
        y: point[yStat],
        name: point.name,
        teamName: point.teamName
      });
    }
  }
  return scatterData;
}

function generateLinePts(scatterData, maxX, canvasName) {
  const lineEquation = calculateLinearRegression(scatterData);
  const slope = ((lineEquation(1) - lineEquation(0)) * 1000)
  .toFixed(4);
  const intercept = lineEquation(0)
  .toFixed(4);

    document.getElementById(
      `${canvasName}-linear-slope`
      ).innerText = slope;
      
    document.getElementById(
      `${canvasName}-linear-intercept`
    ).innerText = intercept;

  return [{ x: 0, y: lineEquation(0) }, { x: maxX, y: lineEquation(maxX) }];
}

function generateScatterChart(canvasName, title, unorderedData, xStat, yStat) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  const scatterData = generateScatterData(unorderedData, xStat, yStat);

  const labels = scatterData.map(p => `${p.name} (${p.teamName})`);

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
            labelString: 'Team Surpassing Efficiency'
          }
        }
      ]
    },
    tooltips: {
      intersect: false,
      callbacks: {
        title: function(tooltipItems, data) {
          return data.labels[tooltipItems[0].index];
        },
        label: function(tooltipItem, data) {
          return `(${tooltipItem.xLabel}, ${tooltipItem.yLabel})`;
        }
      }
    }
  };

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: chartData,
    options: options
  });
  return scatterChart;
}


function generateScatterChartWithLine(
  canvasName,
  title,
  unorderedData,
  xStat,
  yStat
) {
  var ctx = document.getElementById(canvasName).getContext('2d');

  const scatterData = generateScatterData(unorderedData, xStat, yStat).filter(d => d.x > 10);

  let maxX = 0;
  for (point of unorderedData) {
    if (point[xStat] > maxX) {
      maxX = Math.ceil(point[xStat] / 50) * 50;
    }
  }
  const linePts = generateLinePts(scatterData, maxX, canvasName);

  const labels = scatterData.map(p => p.name);

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
      },
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
          if (tooltipItems[0].datasetIndex === 1) {
            return '';
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
  const regressionData = [];
  for (point of scatterData) {
    regressionData.push([point.x, point.y]);
  }

  var line = ss
    .linear_regression()
    .data(regressionData)
    .line();

  // Get the r-squared value of the line estimation
  // ss.r_squared(regressionData, line);
  return line;
}
