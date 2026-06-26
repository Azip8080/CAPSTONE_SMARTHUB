import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function useChart(canvasRef, config) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !config) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, config);

        return () => chartRef.current?.destroy();
    }, [config]);
}