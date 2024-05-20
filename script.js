const canvas = document.getElementById('sinusCanvas');
const ctx = canvas.getContext('2d');

let bereichWahl = 1000;
let zoomFactor = 1;
let animationId;
$('#zoomFactor').attr('value', 1000);


function updateRanges() {
    const bereich = parseFloat($('#bereich').val());
    const maxVal = bereich * bereichWahl;
    $('#LVal').attr('max', maxVal);
    $('#LVal').attr('min', bereich);
    $('#LVal').attr('step', bereich / 1000);
    $('#LVal').attr('value', 1e-3);
    $('#CVal').attr('max', maxVal);
    $('#CVal').attr('min', bereich);
    $('#CVal').attr('step', bereich / 1000);
    $('#CVal').attr('value', 1e-6);
    $('#RVal').attr('max', $('#bereichR').val() * 1000);
    $('#RVal').attr('min', $('#bereichR').val());
    if($('#bereichR').val() == 1e-3){
        $('#RVal').attr('step', 0.001);
    } else {
        $('#RVal').attr('step', 1);
    }
    $('#RVal').attr('value', 1);

    switch($('#bereich').val()){
        case '1e-3':
            $('#zoomFactor').attr('max', 10);
            break;
        case '1e-6':
            $('#zoomFactor').attr('max', 10000);
            break;
        case '1e-9':
            $('#zoomFactor').attr('max', 10000000);
            break;
        case '1e-12':
            $('#zoomFactor').attr('max', 10000000000);
            break;
    }

    getValues();
}

$('#circuitType').on('input', getValues);
$('#resistorPosition').on('input', getValues);
$('#eingabe').on('input', function(){
    $('#LVal').attr('type', $('#eingabe').val());
    $('#CVal').attr('type', $('#eingabe').val());
    $('#RVal').attr('type', $('#eingabe').val());
    $('#zoomFactor').attr('type', $('#eingabe').val());
});

$('#bereichWahl').on('input', function(){
    bereichWahl = parseFloat($('#bereichWahl').val());
    updateRanges();
});

$('#bereich').on('input', updateRanges);
$('#LVal').on('input', getValues);
$('#CVal').on('input', getValues);
$('#RVal').on('input', getValues);
$('#zoomFactor').on('input', function() {
    zoomFactor = parseFloat($('#zoomFactor').val());
    drawPSK();
});
$('#amplitude').on('input', function() {
    drawPSK();
});

$('#ldicke').on('input', function() {
    drawPSK();
});

$('#timeRange').on('input', function() {
    drawPSK();
});

$('#fontSize').on('input', function() {
    drawPSK();
});

$('#UVal').on('input', function() {
    drawPSK();
});

$('#bereichR').on('input', function() {
    updateRanges();
});

zoomFactor = 1000;

function getValues(){
    const L = parseFloat($('#LVal').val());
    const C = parseFloat($('#CVal').val());
    const R = parseFloat($('#RVal').val());
    const circuitType = $('#circuitType').val();
    const resistorPosition = $('#resistorPosition').val();
    let f0, f_damped, Q, B, alpha, dampingTime;

    if (circuitType === "series") {
        f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        if (resistorPosition === "series") {
            f_damped = f0 * Math.sqrt(1 - Math.pow(R / (2 * Math.sqrt(L / C)), 2));
            Q = (1 / R) * Math.sqrt(L / C);
            alpha = R / (2 * L);
        } else {
            f_damped = f0;
            Q = R * Math.sqrt(C / L);
            alpha = 1 / (R * C);
        }
    } else {
        f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        f_damped = 1 / (2 * Math.PI * Math.sqrt((L * C) / (1 + Math.pow((R / (2 * Math.sqrt(L / C))), 2))));
        Q = R * Math.sqrt(C / L);
        alpha = 1 / (R * C);
    }

    B = f0 / Q;
    dampingTime = 1 / alpha;

    $('#out').text('L = ' + formatUnit(L) + "H, C = " + formatUnit(C) + "F, R = " + formatUnit(R) + "Ω");
    $('#frequency').html('Ungedämpfte Frequenz (f0) = ' + formatUnit(f0.toFixed(2)) + 'Hz, Gedämpfte Frequenz = ' + formatUnit(f_damped.toFixed(2)) + 'Hz');
    $('#quality').text('Güte (Q) = ' + Q.toFixed(2));
    $('#bandwidth').text('Bandbreite (B) = ' + formatUnit(B) + 'Hz');
    $('#dampingTime').text('Dämpfungszeit (\( t_d \)) = ' + formatUnit(dampingTime) + 's');
    drawPSK();
}

function formatUnit(value, float) {
    if(float == ''){
        float = 2
    }

    value = parseFloat(value);
    if (value >= 1e9) return (value / 1e9).toFixed(float) + ' E';
    if (value >= 1e9) return (value / 1e9).toFixed(float) + ' P';
    if (value >= 1e9) return (value / 1e9).toFixed(float) + ' T';
    if (value >= 1e9) return (value / 1e9).toFixed(float) + ' G';
    if (value >= 1e6) return (value / 1e6).toFixed(float) + ' M';
    if (value >= 1e3) return (value / 1e3).toFixed(float) + ' k';
    if (value >= 1) return value.toFixed(2);
    if (value >= 1e-3) return (value * 1e3).toFixed(float) + ' m';
    if (value >= 1e-6) return (value * 1e6).toFixed(float) + ' µ';
    if (value >= 1e-9) return (value * 1e9).toFixed(float) + ' n';
    if (value >= 1e-12) return (value * 1e12).toFixed(float) + ' p';
    return value;
}

const dt = 0.01;
const offsetX = 100;
const offsetY = canvas.height / 2;

function drawPSK() {
    const L = parseFloat($('#LVal').val());
    const C = parseFloat($('#CVal').val());
    const R = parseFloat($('#RVal').val());
    const circuitType = $('#circuitType').val();
    const resistorPosition = $('#resistorPosition').val();
    let f0, f_damped;

    if (circuitType === "series") {
        f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        if (resistorPosition === "series") {
            f_damped = f0 * Math.sqrt(1 - Math.pow(R / (2 * Math.sqrt(L / C)), 2));
        } else {
            f_damped = f0;
        }
    } else {
        f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        f_damped = 1 / (2 * Math.PI * Math.sqrt((L * C) / (1 + Math.pow((R / (2 * Math.sqrt(L / C))), 2))));
    }

    function simulate(t) {
        const alpha = R / (2 * L);
        return $('#amplitude').val() * Math.exp(-alpha * t) * Math.cos(2 * Math.PI * f_damped * t);
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    // Achsen zeichnen und beschriften
    ctx.strokeStyle = '#aaffaaaF';
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.stroke();
    ctx.fillStyle = "#bfbfbf";
    ctx.font = $('#fontSize').val()+"px Arial";

    ctx.fillText("Amplitude (V)", offsetX + 10, 20); // Y-Achsenbeschriftung

    ctx.beginPath();
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();

    // Zeit auf der X-Achse anzeigen
    const numTicks = 6;
    const tickSpacing = (canvas.width - offsetX) / $('#timeRange').val();
    for (let i = 0; i <= $('#timeRange').val(); i++) {
        let x = offsetX + i * tickSpacing;
        let t = formatUnit((i * tickSpacing * dt / zoomFactor));
        ctx.fillText(t + "s", x, offsetY + 20); // X-Achsenbeschriftung
    }

    // Y-Achse anzeigen
    const yTicks = 5;
    const maxY = parseFloat($('#UVal').val());
    const yTickSpacing = (canvas.height / 2) / yTicks;
    for (let i = 0; i <= yTicks; i++) {
        let y = offsetY - i * yTickSpacing;
        let yValue = (i * maxY / yTicks).toFixed(1);
        ctx.fillText(yValue + "V", 10, y); // Y-Achsenbeschriftung (positiv)
        ctx.fillText(-yValue + "V", 10, canvas.height - y); // Y-Achsenbeschriftung (negativ)
    }

    ctx.strokeStyle = '#bfbfbf';
    ctx.lineWidth = $('#ldicke').val();

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        let t = x * dt / zoomFactor;
        let y = simulate(t);
        ctx.lineTo(offsetX + x, offsetY - y);
    }
    ctx.stroke();

    time += dt;
    animationId = requestAnimationFrame(drawPSK);
}

$(document).ready(function() {
    updateRanges();
    getValues();
});


downloadBtn.addEventListener('click', function() {
    // Daten-URL des Canvas als PNG-Bild erhalten
    var dataURL = canvas.toDataURL('image/png');

    // Ein temporäres Link-Element erstellen
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'schwingkreis.png';

    // Klick-Event auf dem Link auslösen
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});