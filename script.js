// ===============================
// BVLTNE v0.4
// ===============================

// ---------- Supabase ----------

const SUPABASE_URL = "https://qypotzqpbjgnyvraiajk.supabase.co";

const SUPABASE_KEY =
"sb_publishable_WJeDy9HerJD_SXy1sA018w_MBTkgsW6";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("BVLTNE Connected");


// ---------- Page Control ----------

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

    }

    else {

        alert("Wrong Password");

    }

}

function startSession() {

    alert("Artist page will be built next.");

}


// ---------- Save Session ----------

async function testBackend() {

    const sessionName = document.getElementById("sessionName").value.trim();
    const lyrics = document.getElementById("lyrics").value.trim();

    const instrumental =
        document.getElementById("instrumentalFile").files[0];

    const guide =
        document.getElementById("guideFile").files[0];

    if (!sessionName) {

        alert("Please enter Session Name.");

        return;

    }

    // Database 저장

    const { error } = await db
        .from("sessions")
        .insert([
            {
                session_name: sessionName,
                lyrics: lyrics
            }
        ]);

    if (error) {

        alert(error.message);

        return;

    }

    alert("Session saved.\n\nNext step: Upload will be added.");

}


// ---------- Events ----------

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("startBtn")
        ?.addEventListener("click", startSession);

    document.getElementById("producerLink")
        ?.addEventListener("click", showLogin);

    document.getElementById("loginBtn")
        ?.addEventListener("click", login);

    document.getElementById("backBtn")
        ?.addEventListener("click", goHome);

    document.getElementById("instrumentalFile")
        ?.addEventListener("change", function () {

            const file = this.files[0];

            document.getElementById("instrumentalName").innerText =
                file ? file.name : "No file selected";

        });

    document.getElementById("guideFile")
        ?.addEventListener("change", function () {

            const file = this.files[0];

            document.getElementById("guideName").innerText =
                file ? file.name : "No file selected";

        });

});
