// ===== 기본 자원 =====
let population = 0;
let realPopulation = 0;
let money = 500;
let happiness = 50;
let food = 50;
let power = 50;

let taxRate = 3;
let selectedBuilding = null;
let cityHallBuilt = false;

// ===== 건물 데이터 =====
const buildings = {
    house: { icon: "🏠", cost: 50, capacity: 5, upkeep: 2 },
    apartment: { icon: "🏢", cost: 200, capacity: 20, upkeep: 8, happiness: -2 },
    farm: { icon: "🌾", cost: 120, food: 15 },
    shop: { icon: "🏬", cost: 150, income: 20, happiness: 2 },
    factory: { icon: "🏭", cost: 250, income: 40, happiness: -5 },
    powerplant: { icon: "⚡", cost: 300, power: 50, happiness: -3 },
    park: { icon: "🌳", cost: 100, happiness: 6, upkeep: 3 },
    hospital: { icon: "🏥", cost: 220, happiness: 5, upkeep: 10 },
    school: { icon: "🏫", cost: 200, happiness: 3, upkeep: 8 },
    police: { icon: "🚓", cost: 180, happiness: 2, upkeep: 6 },
    bank: { icon: "🏦", cost: 300, taxBoost: 0.15 },
    cityhall: { icon: "🏛", cost: 500, taxBoost: 0.10 }
};

// ===== 맵 생성 =====
const mapElement = document.getElementById("map");
let mapData = [];

function createMap() {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleCellClick);

        mapElement.appendChild(cell);
        mapData.push(null);
    }
}

// ===== 클릭 처리 =====
function handleCellClick(e) {
    const index = e.target.dataset.index;

    if (!selectedBuilding) return;

    if (selectedBuilding === "bulldoze") {
        if (mapData[index]) {
            money += 20; // 일부 환급
            mapData[index] = null;
            e.target.textContent = "";
            updateStats();
        }
        return;
    }

    const building = buildings[selectedBuilding];

    if (!building) return;
    if (money < building.cost) return alert("자금 부족");

    if (selectedBuilding === "cityhall" && cityHallBuilt) {
        return alert("시청은 하나만 건설 가능");
    }

    if (mapData[index]) return;

    money -= building.cost;
    mapData[index] = selectedBuilding;
    e.target.textContent = building.icon;

    if (selectedBuilding === "cityhall") {
        cityHallBuilt = true;
    }

    updateStats();
}

// ===== 버튼 선택 =====
document.querySelectorAll("#build-menu button").forEach(btn => {
    btn.addEventListener("click", () => {

        selectedBuilding = btn.dataset.building;

        document.getElementById("selected-info").textContent =
            "선택된 건물: " + btn.textContent;

        if (selectedBuilding === "bulldoze") {
            document.getElementById("building-info").innerHTML =
                "철거: 기존 건물을 제거하고 일부 자금을 환급받습니다.";
            return;
        }

        const b = buildings[selectedBuilding];
        if (!b) return;

        let info = `건설 비용: ${b.cost}<br>`;

        if (b.capacity) info += `수용 인구: +${b.capacity}<br>`;
        if (b.income) info += `수익: +${b.income} /주기<br>`;
        if (b.food) info += `식량 생산: +${b.food}<br>`;
        if (b.power) info += `전력 생산: +${b.power}<br>`;
        if (b.happiness) info += `행복도 변화: ${b.happiness}<br>`;
        if (b.upkeep) info += `유지비: -${b.upkeep} /주기<br>`;
        if (b.taxBoost) info += `세금 효율 증가: +${b.taxBoost * 100}%<br>`;

        document.getElementById("building-info").innerHTML = info;
    });
});


// ===== 세율 변경 =====
document.getElementById("tax-rate").addEventListener("change", (e) => {
    taxRate = parseInt(e.target.value);
});

// ===== 자원 계산 =====
function calculateResources() {

    // ===== 모든 기본 변수 선언 =====
    let capacity = 0;
    let population = 0;
    let food = 0;
    let power = 0;
    let income = 0;
    let upkeep = 0;
    let taxBoost = 0;
    let happinessChange = 0; // 건물 행복 효과 따로 저장

    // ===== 맵 순회 =====
    mapData.forEach(type => {
        if (!type) return;

        const b = buildings[type];

        if (b.capacity) capacity += b.capacity;
        if (b.food) food += b.food;
        if (b.power) power += b.power;
        if (b.income) income += b.income;
        if (b.upkeep) upkeep += b.upkeep;
        if (b.happiness) happinessChange += b.happiness;
        if (b.taxBoost) taxBoost += b.taxBoost;
    });

    // ===== 행복도 계산 =====
    happiness += happinessChange;

    if (taxRate === 6) happiness -= 2;
    if (taxRate === 1) happiness += 1;

    if (food < population) happiness -= 3;
    if (power < population) happiness -= 2;

    happiness = Math.max(0, Math.min(100, happiness));

    // ===== 인구 증감 =====
    if (happiness >= 20) {
        if (realPopulation < capacity) {
            realPopulation += Math.ceil(capacity * 0.05);
        }
    } else {
        realPopulation -= Math.ceil(realPopulation * 0.1);
    }

    realPopulation = Math.max(0, Math.min(capacity, realPopulation));
    population = realPopulation;

    // ===== 세금/수익 =====
    let taxIncome = population * taxRate * (1 + taxBoost);
    money += income + taxIncome - upkeep;

    // ===== UI 업데이트 =====
    updateStats();
}


// ===== UI 업데이트 =====
function updateStats() {
    document.getElementById("population").textContent = population;
    document.getElementById("money").textContent = Math.floor(money);
    document.getElementById("happiness").textContent = happiness;
    document.getElementById("food").textContent = food;
    document.getElementById("power").textContent = power;
}

// ===== 게임 루프 (10초마다 계산) =====
setInterval(calculateResources, 10000);

// 시작
createMap();
updateStats();

const modal = document.getElementById("rule-modal");
const closeModal = document.getElementById("close-modal");
const openRules = document.getElementById("open-rules");

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("rule-modal");
    const closeModal = document.getElementById("close-modal");
    const openRules = document.getElementById("open-rules");

    // 시작 시 자동 표시
    modal.style.display = "flex";

    // 닫기 버튼
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // 다시 열기
    openRules.addEventListener("click", function () {
        modal.style.display = "flex";
    });

});
