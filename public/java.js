function checkDrink() {

const inputElement = document.getElementById("drinkInput");

const text = inputElement.value.trim().toLowerCase();

const bubble = document.getElementById("bubble");

const selectedText = document.getElementById("chosenText");

const healthBadge = document.getElementById("healthBadge");

const ratingImage = document.getElementById("ratingImage");

const drinkInfo = document.getElementById("drinkInfo");


if (!text) return;


bubble.style.display = "block";

selectedText.textContent = "Избрахте: " + text;



// 🟢 ВОДА
if (text === "вода") {

healthBadge.textContent = "Добро";

healthBadge.className = "badge good";

drinkInfo.textContent = "Водата е здравословна, без захар.";

setRating(5);

return;

}


// 🔴 КОЛА
if (text === "кола") {

healthBadge.textContent = "Внимавай";

healthBadge.className = "badge bad";

drinkInfo.textContent = "Колата съдържа много захар.";

setRating(1);

return;

}


// ❌ НЕ Е НАПИТКА

healthBadge.textContent = "Не е напитка";

healthBadge.className = "badge warning";

drinkInfo.textContent = "Въведеното не е напитка.";

setRating(1);

}



// ⭐ функция за снимките

function setRating(rating){

const ratingImage = document.getElementById("ratingImage");


let imageName = "";


if(rating === 1) imageName = "12.png";

if(rating === 2) imageName = "34.png";

if(rating === 3) imageName = "56.png";

if(rating === 4) imageName = "78.png";

if(rating === 5) imageName = "910.png";


ratingImage.src = "images/" + imageName;

}



// ❌ CLEAR BUTTON

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", function () {

document.getElementById("drinkInput").value = "";

document.getElementById("bubble").style.display = "none";

});
