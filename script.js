function hideAll() {
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("producerPage").classList.add("hidden");
}

function goHome() {
  hideAll();
  document.getElementById("homePage").classList.remove("hidden");
}

function showLogin() {
  hideAll();
  document.getElementById("loginPage").classList.remove("hidden");
}

function login() {
  const pw = document.getElementById("password").value;
  if (pw === "010305") {
    hideAll();
    document.getElementById("producerPage").classList.remove("hidden");
  } else {
    alert("Wrong password.");
  }
}

function startSession() {
  alert("Artist page will be built next.");
}

function nextProducer() {
  const session = document.getElementById("sessionName").value.trim();
  const inst = document.getElementById("instrumentalFile").files.length;
  const guide = document.getElementById("guideFile").files.length;
  const lyrics = document.getElementById("lyrics").value.trim();

  if (session === "" || !inst || !guide || lyrics === "") {
    alert("Please complete all fields.");
    return;
  }

  alert("Success!\n\nNext version will generate the Artist Session.");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startSession);
  document.getElementById("producerLink").addEventListener("click", showLogin);
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("backBtn").addEventListener("click", goHome);
  document.getElementById("nextBtn").addEventListener("click", nextProducer);

  document.getElementById("instrumentalFile").addEventListener("change", function () {
    const file = this.files[0];
    document.getElementById("instrumentalName").innerText = file ? file.name : "No file selected";
  });

  document.getElementById("guideFile").addEventListener("change", function () {
    const file = this.files[0];
    async function testBackend() {

  const response = await fetch("https://script.google.com/macros/s/AKfycbwIMpWSBMevxoYKcQCPPh59PAP-JVEeeEZd9AOoVwxNhLom2bIsfr2RhrG65OS1yTth/exec", {

    method: "POST",

    body: JSON.stringify({

      session: "Test Session",

      lyrics: "Hello World"

    })

  });

  const text = await response.text();

  alert(text);

}
    document.getElementById("guideName").innerText = file ? file.name : "No file selected";
  });
});
