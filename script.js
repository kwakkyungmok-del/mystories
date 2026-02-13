const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let citizens = [];
let infected = [];
let soldiers = [];

const citizenImg = new Image();
citizenImg.src = "assets/soldier.png"; // 지금은 테스트용 (이미지 하나만 있어도 됨)

const infectedImg = new Image();
infectedImg.src = "assets/soldier.png";

const soldierImg = new Image();
soldierImg.src = "assets/soldier.png";

const width = canvas.width;
const height = canvas.height;

function randomPos() {
    return {
        x: Math.random() * (width - 30),
        y: Math.random() * (height - 30)
    };
}

function createCitizens(count) {
    citizens = [];
    for (let i = 0; i < count; i++) {
        let pos = randomPos();
        citizens.push({ x: pos.x, y: pos.y });
    }
}

function createInfected(count) {
    infected = [];
    for (let i = 0; i < count; i++) {
        let pos = randomPos();
        infected.push({ x: pos.x, y: pos.y });
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    citizens.forEach(c => {
        ctx.drawImage(citizenImg, c.x, c.y, 25, 25);
    });

    infected.forEach(i => {
        ctx.drawImage(infectedImg, i.x, i.y, 25, 25);
    });

    soldiers.forEach(s => {
        ctx.drawImage(soldierImg, s.x, s.y, 30, 30);
    });
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function infectionStep() {
    citizens.forEach((c, ci) => {
        infected.forEach(i => {
            if (distance(c, i) < 40) {
                if (Math.random() < 0.2) {
                    infected.push(c);
                    citizens.splice(ci, 1);
                }
            }
        });
    });

    document.getElementById("citizenCount").textContent = citizens.length;
    document.getElementById("infectedCount").textContent = infected.length;
}

function deploySoldiers() {
    for (let i = 0; i < 3; i++) {
        let pos = randomPos();
        soldiers.push({ x: pos.x, y: pos.y });
    }
}

function resetGame() {
    soldiers = [];
    createCitizens(15);
    createInfected(1);
}

function gameLoop() {
    infectionStep();
    draw();
}

createCitizens(15);
createInfected(1);

setInterval(gameLoop, 1000);

