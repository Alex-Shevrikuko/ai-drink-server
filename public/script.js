const input = document.querySelector(".search-wrapper input");
const bubble = document.getElementById("bubble");
const chosenText = document.getElementById("chosenText");
const drinkInfo = document.getElementById("drinkInfo");
const healthBadge = document.getElementById("healthBadge");
const ratingImage = document.getElementById("ratingImage");

// функция за снимките
function setRating(rating){
  let imageName = "";
  if(rating === 1) imageName = "12.png";
  if(rating === 2) imageName = "34.png";
  if(rating === 3) imageName = "56.png";
  if(rating === 4) imageName = "78.png";
  if(rating === 5) imageName = "910.png";
  ratingImage.src = "images/" + imageName;
}

// Clear Button
document.getElementById("clearBtn").addEventListener("click", function(){
  input.value = "";
  bubble.style.display = "none";
  chosenText.textContent = "Избрахте:";
  drinkInfo.textContent = "";
  healthBadge.textContent = "Добро";
  healthBadge.className = "badge good";
  setRating(5);
});

// Основна функция за AI оценка
input.addEventListener("keydown", async function(e){
  if(e.key === "Enter"){
    const drinkName = input.value.trim();
    if(!drinkName) return;

    bubble.style.display = "block";
    chosenText.textContent = `Избрахте: ${drinkName}`;
drinkInfo.textContent = "Мисля...";
healthBadge.textContent = "Оценяване...";
healthBadge.className = "badge warning";
bubble.style.display = "block";
    try {
      const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: drinkName })
      });
     // UNKNOWN (не е напитка)
if (data.type === "unknown") {

  healthBadge.textContent = "Не е напитка";
  healthBadge.className = "badge warning";

  drinkInfo.textContent = data.description;

  setRating(3); // неутрална снимка
  return;
}


// DRINK
healthBadge.textContent = data.label || "Оценено";

// цветове
if (data.label === "Добро") {
  healthBadge.className = "badge good";
} else {
  healthBadge.className = "badge bad";
}

drinkInfo.textContent = data.description;

// снимка според rating
setRating(Number(data.rating) || 3);
      console.log(data);

      drinkInfo.textContent = data.description;
      healthBadge.textContent = data.label;
      healthBadge.className = `badge ${data.labelClass}`;
      setRating(data.rating);

    }catch (err) {

      console.log("OPENAI ERROR:");
      console.log(err);
      console.error(err);
      drinkInfo.textContent = "Грешка при оценката на напитката.";
      healthBadge.textContent = "Неизвестно";
      healthBadge.className = "badge warning";
      setRating(3);
    }
  }
});






