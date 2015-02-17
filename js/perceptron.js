var PIXEL_SIZE = 50; //pixels

var GRID_WIDTH = 0;
var GRID_HEIGHT = 0;

var OUTPUT_COUNT = 6;

var pixels = [];

var tableauDePoids = [];

var tableauDesInputs = [];

var mousePressed = false;
var mousePixelIndex = -1;

var TX_APPRENTISSAGE = 1;

var ACTIVATION = 3;

var CHARGE = 0.5;

function init() {

    var canvas = document.getElementById("canvas");
    GRID_WIDTH = Math.floor(canvas.width/PIXEL_SIZE);
    GRID_HEIGHT = Math.floor(canvas.height/PIXEL_SIZE);

    resetCanvas();

    initInputsTab();

    canvas.addEventListener("click", function(e) {
        var mousePoint = mouseCanvasPosition(e);
        togglePixelAtPoint(mousePoint);
        mousePressed = true;
        drawPixels();
    });

    canvas.addEventListener("mousedown", function(e) {
        mousePressed = true;
    }, false);
    canvas.addEventListener("mouseup", function(e) {
        mousePressed = false;
    }, false);

    canvas.addEventListener("mousemove", function(e) {
        if(mousePressed) {
            var mousePoint = mouseCanvasPosition(e);
            var pixelIndex = pixelIndexAtPoint(e);
            if(pixelIndex != mousePixelIndex) {
                setPixelValueAtPoint(mousePoint, true);
                drawPixels();
                mousePixelIndex = pixelIndex;
            }
        }
    })
}

function learnClicked() {
    var learnedNumber = parseInt($("#inputNumber").val());
    learn(learnedNumber);
    processClicked();
    initChart();
}

function processClicked() {
    processedNumbers = [];
    processedNumbers = process();
    showProcessedNumbers(processedNumbers);
}

function showProcessedNumbers(processedNumbers) {

    var result = "";
    for (var number = 0; number < OUTPUT_COUNT; number++) {
        if (processedNumbers[number] == true) {
            result += number + ", ";
        }
    }

    if(result.length > 0) result = result.substring(0, result.length-1);
    $("#outputNumber").val(result);
}

/* ------  */

function learn(expectedNumber) {
    var tableauDeSorties = [];
    tableauDeSorties = process();

    for (var number = 0; number < OUTPUT_COUNT; number++) {
        var obtenu = tableauDeSorties[number] ? 1: 0;
        var attendu = isExpectedNumber(number, expectedNumber);

        for(var x=0; x <GRID_WIDTH; x++){
            for(var y=0; y<GRID_HEIGHT; y++){
                var active = pixels[x][y] ? 1 :0;
                tableauDesInputs[number][x][y] =  tableauDesInputs[number][x][y] + ((attendu - obtenu) * active * CHARGE);
                tableauDePoids[parseInt(expectedNumber)-1] = tableauDePoids[parseInt(expectedNumber)-1] !== undefined ? tableauDePoids[parseInt(expectedNumber)-1] : 0;
                tableauDePoids[parseInt(expectedNumber)-1] = Math.abs(tableauDePoids[parseInt(expectedNumber)-1] + tableauDesInputs[number][x][y]);
            }
        }
    }
}

function process() {
    var sorties = [];
    var estActive = 0;
    sorties = initOutputsTab(sorties);

    for(var number = 0; number < OUTPUT_COUNT; number++){

        for(var x=0; x <GRID_WIDTH; x++){
            for(var y=0; y<GRID_HEIGHT; y++){
                if (pixels[x][y] == true) {
                    estActive += tableauDesInputs[number][x][y]
                }
            }
        }
        if (estActive >= ACTIVATION) {
            sorties[number] = true;
        }
    }
    return sorties;
}

function initInputsTab(){
    for(var number=0; number <OUTPUT_COUNT; number++){
        tableauDesInputs[number] = [];

        for(var x =0; x < GRID_WIDTH; x++){
            tableauDesInputs[number][x] = [];
            for(var y=0; y <GRID_HEIGHT; y++){
                tableauDesInputs[number][x][y] = 0;
            }
        }
    }
}

function initOutputsTab(sorties){
    for(var i=0; i<OUTPUT_COUNT; i++){
        sorties[i] = 0;
    }
    return sorties;
}

function isExpectedNumber(number,expectedNumber){
    var result = 0;
    if (number == expectedNumber) {
        result = 1;
    }
    return result;
}

function initChart(){
    console.log(tableauDePoids);
    var ctx = document.getElementById("chart").getContext("2d");
    var data = {
        labels: ["1", "2", "3", "4", "5", "6"],
        datasets: [
            {
                label: "Weight of connections",
                fillColor: "rgba(255,192,203,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: tableauDePoids//[tableauDePoids[1],0,0,0,0,0]
            }
        ]
    };
    var chart = new Chart(ctx).Radar(data);
}

/* ------  */


function mouseCanvasPosition(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function pixelIndexAtPoint(point) {
    var pixelIndex = -1;
    var x = Math.floor(point.x/PIXEL_SIZE);
    var y = Math.floor(point.y/PIXEL_SIZE);
    if(x < GRID_WIDTH && y < GRID_HEIGHT) {
        pixelIndex = y * GRID_WIDTH + x;
    }
    return pixelIndex;
}

function togglePixelAtPoint(point) {
    var x = Math.floor(point.x/PIXEL_SIZE);
    var y = Math.floor(point.y/PIXEL_SIZE);
    if(x < GRID_WIDTH && y < GRID_HEIGHT) {
        pixels[x][y] = !pixels[x][y];
    }
}

function setPixelValueAtPoint(point, value) {
    var x = Math.floor(point.x/PIXEL_SIZE);
    var y = Math.floor(point.y/PIXEL_SIZE);
    if(x < GRID_WIDTH && y < GRID_HEIGHT) {
        pixels[x][y] = value;
    }
}

function resetCanvas() {
    $('#inputNumber').val('');
    $('#outputNumber').val('');
    resetPixels();
    drawPixels();
}

function resetPixels() {
    for(var x = 0; x < GRID_WIDTH; x++) {
        pixels[x] = [];
        for(var y = 0; y < GRID_HEIGHT; y++) {
            pixels[x][y] = false;
        }
    }
}

function drawPixels() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    for(var y = 0; y < GRID_HEIGHT; y++) {
        for(var x = 0; x < GRID_WIDTH; x++) {
            context.beginPath();
            context.rect(x*PIXEL_SIZE, y*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            context.fillStyle = pixels[x][y] ? '#E74944' : '#DCDCDC';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = '#777';
            context.stroke();
        }
    }
}
