let anger = 85;
let memory = JSON.parse(localStorage.getItem("aiMemory")) || [];
let conversation = JSON.parse(localStorage.getItem("conversation")) || [];

const angerBar = document.getElementById("angerBar");
const angerPercent = document.getElementById("angerPercent");
const inputField = document.getElementById("userInput");
const chatLog = document.getElementById("chatLog");
const result = document.getElementById("result");

const humorWords = ["banana", "chicken", "toilet", "duck", "lol", "haha", "meme"];

// Update anger bar
function updateBar() {
  anger = Math.max(0, Math.min(100, anger));
  angerBar.style.height = anger + "%";
  angerPercent.textContent = Math.round(anger) + "%";

  angerBar.classList.remove("furious", "pulsing");

  if (anger > 80) {
    angerBar.style.background = "linear-gradient(to top, #ff0000, #ff5e00)";
    angerBar.classList.add("furious", "pulsing");
  } else if (anger > 40) {
    angerBar.style.background = "linear-gradient(to top, #ff8c00, #ffd000)";
  } else {
    angerBar.style.background = "linear-gradient(to top, #00c6ff, #0072ff)";
  }
}

// Add message to chat
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;

  const ts = document.createElement("div");
  ts.classList.add("timestamp");
  ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  msg.appendChild(ts);

  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;

  conversation.push({ sender, text });
  localStorage.setItem("conversation", JSON.stringify(conversation));
}

// Analyze input and return score
function analyzeInput(input) {
  let score = 0;
  humorWords.forEach(word => {
    if (input.includes(word)) score++;
  });
  memory.forEach(old => {
    if (input.includes(old.split(" ")[0])) score++;
  });
  return score;
}

// Dynamic AI response
function generateResponse(input, score) {
  let response = "";

  if (!input) {
    anger += 5;
    response = "Say something! Silence is annoying me...";
  } else if (memory.includes(input)) {
    anger += 12;
    response = "You've already said that. Try something new!";
  } else if (score >= 2) {
    anger -= 15;
    response = ["Hmph... that made me smirk.", "Okay, I admit, slightly funny.", "Fine. That works."][Math.floor(Math.random()*3)];
  } else if (score === 1) {
    anger += 5;
    response = ["Meh, not bad but not great.", "I expected better.", "Try again."][Math.floor(Math.random()*3)];
  } else {
    anger += 8;
    response = ["You're testing my patience.", "Pathetic!", "Do better."][Math.floor(Math.random()*3)];
  }

  // Occasionally reference past memory
  if (memory.length > 3 && Math.random() < 0.2) {
    const past = memory[Math.floor(Math.random() * memory.length)];
    response += ` Also, remember when you said "${past}"?`;
  }

  return response;
}

// Send message
function sendMessage() {
  const input = inputField.value.trim().toLowerCase();
  if (!input && anger <= 0) return;

  inputField.value = "";
  addMessage(input, "user");

  memory.push(input);
  if (memory.length > 15) memory.shift();
  localStorage.setItem("aiMemory", JSON.stringify(memory));

  const score = analyzeInput(input);
  const response = generateResponse(input, score);
  addMessage(response, "ai");

  anger += 2; // passive drift
  updateBar();

  if (anger <= 0) {
    addMessage("Fine. You win. 😐", "ai");
    result.textContent = "🏆 YOU WIN";
  }
}

// Enter to send
inputField.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// Restore chat on reload
conversation.forEach(msg => addMessage(msg.text, msg.sender));

updateBar();