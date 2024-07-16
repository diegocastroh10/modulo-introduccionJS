document.addEventListener('DOMContentLoaded', function() {
    const apiURL = 'https://mindicador.cl/api/';
    const inputPrecio = document.getElementById('input_precio');
    const selectMoneda = document.getElementById('moneda');
    const buttonBuscar = document.getElementById('button_buscar');
    const h5Resultado = document.getElementById('h5_resultado');
    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart; // Variable global para mantener la instancia del gráfico

    async function fetchMonedas() {
        try {
            const response = await fetch(apiURL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const monedas = Object.keys(data).filter(key => data[key].codigo);

            monedas.forEach(moneda => {
                const option = document.createElement('option');
                option.value = data[moneda].codigo;
                option.textContent = `${data[moneda].codigo}`;
                selectMoneda.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching monedas:', error);
        }
    }

    async function fetchConversion(moneda, valor) {
        try {
            const response = await fetch(`${apiURL}${moneda}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const valorMoneda = data.serie[0].valor;
            const conversion = valor / valorMoneda;
            return conversion;
        } catch (error) {
            console.error('Error fetching conversion:', error);
        }
    }

    async function fetchHistoricalData(moneda) {
        try {
            const response = await fetch(`${apiURL}${moneda}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.serie.slice(0, 30).reverse(); // Últimos 30 días
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }

    async function updateChart(moneda, showLast10Days = false) {
        let historicalData;
        if (showLast10Days) {
            historicalData = await fetchHistoricalData(moneda);
            historicalData = historicalData.slice(0, 10).reverse(); // Últimos 10 días
        } else {
            historicalData = await fetchHistoricalData(moneda);
        }

        const labels = historicalData.map(entry => entry.fecha.split('T')[0]);
        const valores = historicalData.map(entry => entry.valor);

        // Destruir el gráfico existente si hay alguno
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Historial ${moneda} últimos 30 días `,
                    data: valores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Valor en CLP'
                        }
                    }
                }
            }
            
        });
    }

    buttonBuscar.addEventListener('click', async function() {
        const valor = parseFloat(inputPrecio.value);
        const moneda = selectMoneda.value;
        if (isNaN(valor) || moneda === "") {
            alert('Por favor, ingrese un valor válido y seleccione una moneda.');
            return;
        }

        const conversion = await fetchConversion(moneda, valor);
        h5Resultado.textContent = `Resultado: ${conversion.toFixed(2)}`;

        updateChart(moneda);
    });

    h5Resultado.addEventListener('click', function() {
        if (!myChart) {
            return; // No hacer nada si no hay gráfico
        }

        const currentLabel = myChart.data.datasets[0].label;
        if (currentLabel.includes('últimos 10 días')) {
            // Mostrar todos los datos históricos
            updateChart(selectMoneda.value, false);
        } else {
            // Mostrar solo los últimos 10 días
            updateChart(selectMoneda.value, true);
            myChart.data.datasets[0].label += ' (últimos 10 días)';
            myChart.update();
        }
    });

    fetchMonedas();
});
