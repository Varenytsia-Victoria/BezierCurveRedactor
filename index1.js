const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const pointsList = document.getElementById('pointsList');
const characteristicLineColor = 'blue'; 
const bezierCurveColor = 'black';
const characteristicLinePointColor = 'red';
const characteristicLinePathColor = 'green';
let points = [];
document.getElementById('drawButton').addEventListener('click', draw);


const cellSize = 15.75;

drawCoordinateAxis();

function drawCoordinateAxis() {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 0.25;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 5;

    for (let y = 0; y <= canvas.height; y += cellSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
    }

    for (let x = 0; x <= canvas.width; x += cellSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }

    context.moveTo(centerX, 0);
    context.lineTo(centerX, canvas.height);
    context.moveTo(0, centerY);
    context.lineTo(canvas.width, centerY);

    context.stroke();
}

addRow();

function addRow() {
    const newRow = createPointRow();
    pointsList.appendChild(newRow);
    points.push(newRow);
}

function createPointRow() {
    const newRow = document.createElement('div');
    newRow.innerHTML = `
    <div class="dots">
    <div class="inputs_js">
        <label for="x">X:    [-200;200]</label>
        <input type="number" class="vertex-x" placeholder="Введіть X" oninput="validateInput(this)">
        <label for="y">Y:    [-200;200]</label>
        <input type="number" class="vertex-y" placeholder="Введіть Y" oninput="validateInput(this)">
        <button class="js_btn" onclick="removePoint(this)">Видалити точку</button> 
    </div> 
    </div>`;
    return newRow;
}

function validateInput(input) {
    const value = Number(input.value.replace(',', '.'));

    if (isNaN(value) || value < -200 || value > 200) {
        if (input.classList.contains('vertex-x')) {
            input.placeholder = 'Введіть значення в межах [-200;200]';
        } else if (input.classList.contains('vertex-y')) {
            input.placeholder = 'Введіть значення в межах [-200;200]';
        }
        input.classList.add('error-input'); 
        input.value = ''; 
    } else {
        if (input.classList.contains('vertex-x')) {
            input.placeholder = 'Enter X';
        } else if (input.classList.contains('vertex-y')) {
            input.placeholder = 'Enter Y';
        }
        input.classList.remove('error-input'); 
    }
}

function removePoint(button) {
    const row = button.parentElement.parentElement;
    row.remove();
    points = points.filter(p => p !== row);
    draw();
}

function bernstein(i, n, t) {
    const binomialCoefficient = factorial(n) / (factorial(i) * factorial(n - i));
    return binomialCoefficient * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

function factorial(num) {
    if (num === 0 || num === 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}

function calculateBezierPoint(t, controlPoints) {
    const n = controlPoints.length - 1;
    let result = 0;

    for (let i = 0; i <= n; i++) {
        result += binomialCoefficient(n, i) * Math.pow((1 - t), n - i) * Math.pow(t, i) * controlPoints[i];
    }

    return result;
}



function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    clearCanvas();
    drawCoordinateAxis();
    drawCharacteristicLine(characteristicLineColor);
    drawBezierCurve();
    calculateCoordinates(); 
}

function drawCharacteristicLine(lineColor) {
    context.beginPath();
    context.strokeStyle = lineColor;
    context.lineWidth = 2;

    if (points.length > 0) {
        const controlPointsX = points.map(point => {
            const inputX = point.querySelector('.vertex-x');
            return inputX ? parseFloat(inputX.value) + canvas.width / 2 : null;
        });

        const controlPointsY = points.map(point => {
            const inputY = point.querySelector('.vertex-y');
            return inputY ? -parseFloat(inputY.value) + canvas.height / 2 : null;
        });

        for (let i = 0; i < points.length; i++) {
            const x = controlPointsX[i];
            const y = controlPointsY[i];

            if (x !== null && y !== null) {
                context.fillStyle = characteristicLinePointColor;
                context.beginPath();
                context.arc(x, y, 3, 0, 2 * Math.PI);
                context.fill();
            }
        }

        const validPointsX = controlPointsX.filter(val => val !== null);
        const validPointsY = controlPointsY.filter(val => val !== null);

        if (validPointsX.length > 0 && validPointsY.length > 0) {
            context.moveTo(validPointsX[0], validPointsY[0]);

            for (let i = 1; i < validPointsX.length; i++) {
                const x = validPointsX[i];
                const y = validPointsY[i];
                context.lineTo(x, y);
            }
        }
    }

    context.stroke();
}


function drawBezierCurve() {
    context.beginPath();
    context.strokeStyle = bezierCurveColor;
    context.lineWidth = 2;

    if (points.length >= 2) {
        const controlPointsX = points.map(point => parseFloat(point.querySelector('.vertex-x').value) + canvas.width / 2);
        const controlPointsY = points.map(point => -parseFloat(point.querySelector('.vertex-y').value) + canvas.height / 2);

        const formulaType = document.querySelector('input[name="formulaType"]:checked').value;

        if (formulaType === 'parametric') {
            drawParametricBezierCurve(controlPointsX, controlPointsY);
        } else if (formulaType === 'matrix') {
            drawMatrixBezierCurve(controlPointsX, controlPointsY);
        }
    }

    context.stroke();
}

function drawParametricBezierCurve(controlPointsX, controlPointsY) {
    context.beginPath();

    const x0 = controlPointsX[0];
    const y0 = controlPointsY[0];
    context.moveTo(x0, y0);

    for (let t = 0.001; t <= 1; t += 0.001) {
        const x = calculateBezierPoint(t, controlPointsX);
        const y = calculateBezierPoint(t, controlPointsY);
        context.lineTo(x, y);
    }
}

function drawMatrixBezierCurve(controlPointsX, controlPointsY) {
    const matrixPath = [];

    for (let t = 0; t <= 1; t += 0.001) {
        const [x, y] = calculateMatrixBezierPoint(t, controlPointsX, controlPointsY);
        matrixPath.push([x, y]);
    }

    context.beginPath();
    context.moveTo(matrixPath[0][0], matrixPath[0][1]);

    for (let i = 1; i < matrixPath.length; i++) {
        const [x, y] = matrixPath[i];
        context.lineTo(x, y);
    }

    context.strokeStyle = characteristicLinePathColor;  // Change color for matrix curve
    context.stroke();
    context.closePath();

    // Draw control points
    for (let i = 0; i < controlPointsX.length; i++) {
        const x = controlPointsX[i];
        const y = controlPointsY[i];

        context.fillStyle = 'orange';
        context.beginPath();
        context.arc(x, y, 3, 0, 2 * Math.PI);
        context.fill();
    }
}
//поставити параметричну сюда та й всьо а показати не збережений код та й доста з мене
function binomialCoefficient(n, k) {
    if (k < 0 || k > n) {
        return 0;
    }

    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - i + 1) / i;
    }

    return result;
}

function calculateMatrixBezierPoint(t, controlPointsX, controlPointsY) {
    const n = controlPointsX.length - 1;
    const matrix = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0]
    ];

    let resultX = 0;
    let resultY = 0;

    for (let i = 0; i <= n; i++) {
        const basis = binomialCoefficient(n, i) * Math.pow((1 - t), n - i) * Math.pow(t, i);

        resultX += basis * controlPointsX[i] * matrix[i][0];
        resultY += basis * controlPointsY[i] * matrix[i][1];
    }

    return [resultX, resultY];
}

function saveMatrix() {
    const matrixString = generateMatrixString();
    const blob = new Blob([matrixString], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bezier_matrix.txt';
    a.click();
}

function generateMatrixString() {
    const matrix = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0]
    ];

    return matrix.map(row => row.join('\t')).join('\n');
}

function calculateCoordinates() {
    const formulaType = document.querySelector('input[name="formulaType"]:checked').value;
    const step = parseFloat(document.getElementById('step').value);
    const range = parseFloat(document.getElementById('range').value);

    if (isNaN(step) || isNaN(range) || step <= 0 || range <= 0) {
        return;
    }

    const tValues = Array.from({ length: Math.ceil(range / step) + 1 }, (_, i) => i * step);

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    console.log('Calculated Coordinates:');

    for (const t of tValues) {
        const controlPointsX = points.map(point => parseFloat(point.querySelector('.vertex-x').value) + canvas.width / 2);
        const controlPointsY = points.map(point => -parseFloat(point.querySelector('.vertex-y').value) + canvas.height / 2);

        const x = calculateBezierPoint(t, controlPointsX);
        const y = calculateBezierPoint(t, controlPointsY);

        console.log(`t = ${t}, (${x.toFixed(2)}, ${y.toFixed(2)})`);

        // Додаємо результати на сторінку
        const resultItem = document.createElement('div');
        resultItem.textContent = `t = ${t}, (${x.toFixed(2)}, ${y.toFixed(2)})`;
        resultsContainer.appendChild(resultItem);
    }
}
