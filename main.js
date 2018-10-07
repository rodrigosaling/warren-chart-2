var cdi100Performance = [];

var indexPerformance = [];
var portfolioPerformance = [];
var projectionPerformance = [];
var projectionMaxPerformance = [];
var projectionMinPerformance = [];
var savingsPerformance = [];

var warrenFundPerformance;
var chartStartDate;
var chartEndDate;


function getDates() {
  chartStartDate = moment(warrenFundPerformance.chart.startDate);
  chartEndDate = moment(warrenFundPerformance.chart.endDate);
}

function buildArrays() {
  cdi100Performance = [];

  for (var i = 0; i < warrenFundPerformance.chart.label.length; i++) {
    var monthlyValue = _.findLast(cdiValueChanges, function(item) {
      return item.date <= warrenFundPerformance.chart.label[i];
    });

    cdi100Performance.push(calcCDI(monthlyValue.value, 100));

    // Warren
    // indexPerformance.push(warrenFundPerformance.chart.data.index[i] - warrenFundPerformance.chart.data.index[i-1] || 0);
    // portfolioPerformance.push(warrenFundPerformance.chart.data.portfolio[i] - warrenFundPerformance.chart.data.portfolio[i-1] || 0);
    // projectionPerformance.push(warrenFundPerformance.chart.data.projection[i] - warrenFundPerformance.chart.data.projection[i-1] || 0);
    // projectionMaxPerformance.push(warrenFundPerformance.chart.data.projectionMax[i] - warrenFundPerformance.chart.data.projectionMax[i-1] || 0);
    // projectionMinPerformance.push(warrenFundPerformance.chart.data.projectionMin[i] - warrenFundPerformance.chart.data.projectionMin[i-1] || 0);
    // savingsPerformance.push(warrenFundPerformance.chart.data.savings[i] - warrenFundPerformance.chart.data.savings[i-1] || 0);
  }
}


moment.locale('pt-br');


// chartStartDate = moment(warrenFundPerformance.chart.startDate);
// chartEndDate = moment(warrenFundPerformance.chart.endDate);

// $('#startDate').attr({
//   value: chartStartDate.format('YYYY-MM-DD'),
//   min: chartStartDate.format('YYYY-MM-DD'),
//   max: moment(chartEndDate).subtract(1, 'days').format('YYYY-MM-DD')
// });
// $('#endDate').attr({
//   value: chartEndDate.format('YYYY-MM-DD'),
//   min: moment(chartStartDate).add(1, 'days').format('YYYY-MM-DD'),
//   max: chartEndDate.format('YYYY-MM-DD')
// });

// var dateFormat = 'D [de] MMMM [de] YYYY';

// $('#chartStartDate').html(chartStartDate.format(dateFormat));
// $('#chartEndDate').html(chartEndDate.format(dateFormat));
// $('#updatedOn').html(chartEndDate.format(dateFormat));

// drawChart();

$('#warrenChart').on('submit', function(event) {
  event.preventDefault();
  warrenFundPerformance = JSON.parse($('#serviceResponse').val());
  getDates();
  buildArrays();
  drawChart();
});

/**
 * http://minhaseconomias.com.br/blog/investimentos/como-calcular-o-rendimento-de-seu-investimento-em-de-cdi
 * http://estatisticas.cetip.com.br/astec/di_documentos/metodologia2_i1.htm
 *
 * @param monthlyValue
 * @param percentage
 */
function calcCDI(monthlyValue, percentage) {
  return Decimal(percentage).div(100).times(
    Decimal(monthlyValue).div(100).plus(1).pow(Decimal(1).div(252)).minus(1).toDecimalPlaces(8)
  ).plus(1).toDecimalPlaces(16, Decimal.ROUND_DOWN).toString();
}

function generateChartGraph(id, title, valueField, lineColor, fillAlphas) {
  fillAlphas = fillAlphas || 0;

  return {
    bullet: "round",
    id: id,
    title: title,
    valueField: valueField,
    bulletSize: 5,
    hideBulletsCount: 50,
    lineColor: lineColor,
    precision: 2,
    lineThickness: 2,
    fillAlphas: fillAlphas,
  }
}


function drawChart() {
  var chartData = [];
  var cdi100 = 1;
  var index = 0;
  var portfolio = 0;
  var projection = 0;
  var projectionMax = 0;
  var projectionMin = 0;
  var savings = 0;
  var startDate = chartStartDate;//document.getElementById('startDate').value;
  var endDate = chartEndDate;//document.getElementById('endDate').value;
  var chartGraphs = [];

  chartData.push({
    date: warrenFundPerformance.chart.label[0],
    index: index,
    portfolio: portfolio,
    projection: projection,
    projectionMax: projectionMax,
    projectionMin: projectionMin,
    savings: savings,
    CDI100: Decimal(cdi100).minus(1).toNumber(),
  });

  for (var i = 1; i < warrenFundPerformance.chart.label.length; i++) {

    if (warrenFundPerformance.chart.label[i] >= startDate.format('YYYY-MM-DD') && warrenFundPerformance.chart.label[i] <= endDate.format('YYYY-MM-DD')) {
      var data = {};

      data.date = warrenFundPerformance.chart.label[i];
      data.portfolio = Decimal(warrenFundPerformance.chart.data.portfolio[i]).times(100).toNumber();

      // Calc the next value
      // if (i < warrenFundPerformance.chart.label.length - 1) {
        cdi100 = Decimal(cdi100).times(cdi100Performance[i]).toDecimalPlaces(16, Decimal.ROUND_DOWN);
      // }
      data.CDI100 = Decimal(cdi100).minus(1).toDecimalPlaces(8).times(100).toNumber();

      if (i === 1) {
        chartGraphs.push(generateChartGraph('line1', 'Realizado', 'portfolio', '#006bd6', 0.2));
        chartGraphs.push(generateChartGraph('line2', 'CDI 100%', 'CDI100', '#954ada'));
      }

      if (warrenFundPerformance.chart.data.index) {
        data.index = Decimal(warrenFundPerformance.chart.data.index[i]).times(100).toNumber();
        if (i === 1) {
          chartGraphs.push(generateChartGraph('line3', 'IPCA', 'idnex', '#ffd800'));
        }
      }

      if (warrenFundPerformance.chart.data.savings) {
        data.savings = Decimal(warrenFundPerformance.chart.data.savings[i]).times(100).toNumber();
        if (i === 1) {
          chartGraphs.push(generateChartGraph('line4', 'Poupança', 'savings', '#ff9001'));
        }
      }

      if (warrenFundPerformance.chart.data.projection) {
        data.projection = Decimal(warrenFundPerformance.chart.data.projection[i]).times(100).toNumber();
        data.projectionMax = Decimal(warrenFundPerformance.chart.data.projectionMax[i]).times(100).toNumber();
        data.projectionMin = Decimal(warrenFundPerformance.chart.data.projectionMin[i]).times(100).toNumber();
        if (i === 1) {
          chartGraphs.push(generateChartGraph('line5', 'Projeção Máx', 'projectionMax', '#cbccd7'));
          chartGraphs.push(generateChartGraph('line6', 'Projeção', 'projection', '#696A75'));
          chartGraphs.push(generateChartGraph('line7', 'Projeção Mín', 'projectionMin', '#cbccd7'));
        }
      }

      chartData.push(data);

      // index += indexPerformance[i];
      // portfolio += portfolioPerformance[i];
      // projection += projectionPerformance[i];
      // projectionMax += projectionMaxPerformance[i];
      // projectionMin += projectionMinPerformance[i];
      // savings += savingsPerformance[i];
    }
  }



  var chart = AmCharts.makeChart( 'chartdiv', {
    type: 'serial',
    dataProvider: chartData,
    "categoryField": "date",
    "dataDateFormat": "YYYY-MM-DD",
    "chartScrollbar": {
      "enabled": true
    },
    'mouseWheelZoomEnabled':true,
    'chartCursor': {
      "enabled": true
    },
    "legend": {
      "enabled": true,
      "useGraphSettings": true
    },
    "graphs": chartGraphs
  });
}
