import { chartColors, colors } from '@/config/colors'
import Highcharts from 'highcharts'

export const baseChartOptions: Highcharts.Options = {
    chart: {
        type: 'column',
        height: 340,
        style: {
            fontFamily: 'Inter, sans-serif',
        },
    },
    credits: {
        enabled: false,
    },
    title: { text: '' },
    xAxis: {
        crosshair: true,
        lineColor: chartColors.gridLine,
        tickColor: chartColors.gridLine,
        labels: {
            style: {
                color: colors.gray,
                fontSize: '11px',
            },
        },
    },
    yAxis: [
        {
            title: { text: '' },
            gridLineDashStyle: 'Dash',
            gridLineColor: chartColors.gridLine,
            labels: {
                style: {
                    color: colors.gray,
                },
                formatter: function () {
                    return Highcharts.numberFormat(Number(this.value), 0, '.', ',')
                },
            },
        },
        {
            opposite: true,
            gridLineWidth: 0,
            labels: {
                enabled: false,
            },
            title: {
                text: undefined,
            },
        },
    ],
    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
            color: colors.gray,
            fontWeight: 'normal',
            fontSize: '12px',
        },
        symbolRadius: 0,
        itemDistance: 20,
    },
    tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: colors.white,
        borderColor: colors.gray,
        borderRadius: 8,
        shadow: true,
        padding: 24,
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            borderWidth: 0,
            borderRadius: 0,
        },
        series: {
            marker: {
                symbol: 'circle',
                fillColor: colors.white,
                lineWidth: 2,
                lineColor: undefined,
            },
        },
    },
}
