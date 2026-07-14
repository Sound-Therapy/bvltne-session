// ===============================
// BVLTNE v0.4
// ===============================

// ---------- Supabase ----------

const SUPABASE_URL = "https://mipxgufdyykcudfwsijy.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YJcYWUZqfXZ-vrnAI4DUjw_ZEkhpmoR";

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

    const sessionName =
        document.getElementById("sessionName").value.trim();

    const lyrics =
        document.getElementById("lyrics").value.trim();

    const instrumental =
        document.getElementById("instrumentalFile").files[0];

    const guide =
        document.getElementById("guideFile").files[0];

    if (!sessionName) {
        alert("Please enter Session Name.");
        return;
    }

    if (!instrumental) {
        alert("Please select an Instrumental file.");
        return;
    }

    if (!guide) {
        alert("Please select an Instrumental + Guide file.");
        return;
    }

    // 1. Save session to database
    const { error: dbError } = await db
        .from("sessions")
        .insert([
            {
                session_name: sessionName,
                lyrics: lyrics
            }
        ]);

    if (dbError) {
        alert(dbError.message);
        return;
    }

    // 2. Upload Instrumental
    const { error: instError } = await db.storage
        .from("instrumentals")
      .upload(
    `${sessionName}/${instrumental.name}`,
    instrumental,
    { upsert: true }
);

    if (instError) {
        alert("Instrumental Upload Failed\n\n" + instError.message);
        return;
    }

    // 3. Upload Instrumental + Guide
    const { error: guideError } = await db.storage
        .from("guides")
      .upload(
    `${sessionName}/${guide.name}`,
    guide,
    { upsert: true }
);

    if (guideError) {
        alert("Guide Upload Failed\n\n" + guideError.message);
        return;
    }

    alert("Session Created Successfully!");

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
