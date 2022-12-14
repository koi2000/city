export const initEchartOption1 = (title, lineStyle, dataBJ, dataSH, dataGZ) => {
  return {
    backgroundColor: "rgba(0,0,0,0.5)",
    title: {
      text: title,
      left: "center",
      textStyle: {
        color: "#eee",
      },
    },
    legend: {
      bottom: 5,
      data: ["Morning", "Afternoon", "Evening"],
      itemGap: 20,
      textStyle: {
        color: "#fff",
        fontSize: 14,
      },
      selectedMode: "single",
    },
    radar: {
      indicator: [
        { name: "AQI", max: 300 },
        { name: "PM2.5", max: 250 },
        { name: "PM10", max: 300 },
        { name: "CO", max: 5 },
        { name: "NO2", max: 200 },
        { name: "SO2", max: 100 },
      ],
      shape: "circle",
      splitNumber: 5,
      axisName: {
        color: "rgb(238, 197, 102)",
      },
      splitLine: {
        lineStyle: {
          color: [
            "rgba(238, 197, 102, 0.1)",
            "rgba(238, 197, 102, 0.2)",
            "rgba(238, 197, 102, 0.4)",
            "rgba(238, 197, 102, 0.6)",
            "rgba(238, 197, 102, 0.8)",
            "rgba(238, 197, 102, 1)",
          ].reverse(),
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(238, 197, 102, 0.5)",
        },
      },
    },
    series: [
      {
        name: "Morning",
        type: "radar",
        lineStyle: lineStyle,
        data: dataBJ,
        symbol: "none",
        itemStyle: {
          color: "#F9713C",
        },
        areaStyle: {
          opacity: 0.3,
        },
      },
      {
        name: "Afternoon",
        type: "radar",
        lineStyle: lineStyle,
        data: dataSH,
        symbol: "none",
        itemStyle: {
          color: "#B3E4A1",
        },
        areaStyle: {
          opacity: 0.3,
        },
      },
      {
        name: "Evening",
        type: "radar",
        lineStyle: lineStyle,
        data: dataGZ,
        symbol: "none",
        itemStyle: {
          color: "rgb(238, 197, 102)",
        },
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  };
};
export const initEchartOption2 = (date_lst, real_lst, forecast_lst) => {
  return {
    backgroundColor: "rgba(0,0,0,0.5)",
    title: {
      text: "??????????????????",
      left: "center",
      textStyle: {
        color: "#eee",
        fontSize: 20,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      bottom: 5,
      data: ["??????????????????", "??????????????????"],
      textStyle: {
        color: "#fff",
        fontSize: 11,
      },
    },
    xAxis: [
      {
        type: "category",
        data: date_lst,
        axisLine: {
          lineStyle: {
            color: "#fff",
          },
        },
        axisPointer: {
          type: "shadow",
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "??????????????????",
        min: 0,
        max: 250,
        interval: 50,
        axisLabel: {
          formatter: "{value} ???",
        },
        axisLine: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      {
        type: "value",
        name: "??????????????????",
        min: 0,
        max: 250,
        interval: 50,
        axisLabel: {},
        axisLine: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
    ],
    series: [
      {
        name: "??????????????????",
        type: "bar",
        tooltip: {
          valueFormatter: function (value) {
            return value + " ???";
          },
        },
        data: real_lst,
      },
      {
        name: "??????????????????",
        type: "line",
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: function (value) {
            return value + " ???";
          },
        },
        data: forecast_lst,
      },
    ],
  };
};
