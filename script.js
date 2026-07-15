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
document
    .getElementById("newSessionPanel")
    .classList
    .add("hidden");
    }

    else {

        alert("Wrong Password");

    }

}
function showNewSession() {

    document
        .getElementById("newSessionPanel")
        .classList
        .remove("hidden");

}
async function showSessionManager() {

    document
        .getElementById("newSessionPanel")
        .classList
        .add("hidden");

    document
        .getElementById("sessionManagerPanel")
        .classList
        .remove("hidden");

    const { data, error } = await db
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });

    console.log(data);

    if (error) {

        alert(error.message);

    }
const list = document.getElementById("sessionList");

list.innerHTML = "";

data.forEach(session => {

    list.innerHTML += `
        <div class="card">

            <h3>${session.session_name}</h3>

<b>Code:</b> ${session.s

<button class="openBtn">
    Open
</button>

<button
    class="deleteBtn"
    onclick="deleteSession(${session.id})"
    Delete

</button>

<hr>

        </div>
    `;

});
}

async function deleteSession(id) {

    const ok = confirm(
        "Delete this session?\n\nThis cannot be undone."
    );

    if (!ok) return;

    const result = await db
    .from("sessions")
    .delete()
    .eq("id", id)
    .select();

console.log(result);

alert(JSON.stringify(result, null, 2));

showSessionManager();

}

async function startSession() {

    document
        .getElementById("sessionCode")
        .focus();

}

async function joinSession() {

    const token =
        document
            .getElementById("sessionCode")
            .value
            .trim()
            .toUpperCase();

    if (!token) {

        alert("Please enter Session Code.");

        return;

    }

   const { data, error } = await db
    .from("sessions")
    .select("*")
    .ilike("session_token", token);

console.log(data);
console.log(error);

if (error) {
    alert(error.message);
    return;
}

if (!data || data.length === 0) {
    alert("Session not found.");
    return;
}

const session = data[0];
    console.log("TOKEN =", token);
    console.log("DATA =", data, "ERROR =", error);

    if (error) {

        alert("Session not found.");

        return;

    }

  hideAll();

document
    .getElementById("homePage")
    .classList
    .remove("hidden");

document
    .getElementById("producerLink")
    .style
    .display = "none";

document
    .getElementById("instructionPanel")
    .classList
    .remove("hidden");
document
    .getElementById("joinPanel")
    .style
    .display = "none";
document
    .getElementById("sessionPanel")
    .classList
    .add("hidden");

    document
        .getElementById("currentSessionName")
        .innerText =
       session.session_name;

    document
        .getElementById("currentLyrics")
        .innerText =
        session.lyrics;
    window.currentSession = session;

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
        alert("Please select a Guide Vocal file.");
        return;
    }

    // Safe filenames

    const safeInstName =
        instrumental.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const safeGuideName =
        guide.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Upload Instrumental

    const {
        data: instData,
        error: instError
    } = await db.storage
        .from("instrumentals")
        .upload(
            `${sessionName}/${safeInstName}`,
            instrumental
        );

    if (instError) {
        alert("Instrumental Upload Failed\n\n" + instError.message);
        return;
    }

    // Upload Guide

    const {
        data: guideData,
        error: guideError
    } = await db.storage
        .from("guides")
        .upload(
            `${sessionName}/${safeGuideName}`,
            guide
        );

    if (guideError) {
        alert("Guide Upload Failed\n\n" + guideError.message);
        return;
    }

    // Generate Session Token

    const sessionToken =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    // Save Session

    const { error: dbError } = await db
        .from("sessions")
        .insert([
            {
                session_name: sessionName,
                session_token: sessionToken,
                lyrics: lyrics,
                instrumental_path: instData.path,
                guide_path: guideData.path
            }
        ]);

    if (dbError) {
        alert(dbError.message);
        return;
    }

    // Show Session Panel

    document
        .getElementById("sessionPanel")
        .classList
        .remove("hidden");

    document
        .getElementById("currentSessionName")
        .innerText =
        sessionName;

    document
        .getElementById("currentLyrics")
        .innerText =
        lyrics;

    const sessionLink =
        window.location.origin +
        window.location.pathname +
        "?session=" +
        sessionToken;

    alert(
        "Session Created Successfully!\n\n" +
        sessionLink
    );

}
// ---------- Events ----------

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("startBtn")
        ?.addEventListener("click", startSession);

    document.getElementById("joinBtn")
        ?.addEventListener("click", joinSession);
document.getElementById("newSessionBtn")
    ?.addEventListener("click", showNewSession);
    document.getElementById("sessionManagerBtn")
    ?.addEventListener("click", showSessionManager);
    document.getElementById("readyBtn")
        ?.addEventListener("click", () => {

            document.getElementById("joinPanel").style.display = "none";

            document.getElementById("instructionPanel")
                .classList
                .add("hidden");

            document.getElementById("sessionPanel")
                .classList
                .remove("hidden");

        });

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
