
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDM4BWnLf6jGycrMdQClWtq-Ra2iDidWsQ",
    authDomain: "tech-world-93ee6.firebaseapp.com",
    databaseURL: "https://tech-world-93ee6-default-rtdb.firebaseio.com",
    projectId: "tech-world-93ee6",
    storageBucket: "tech-world-93ee6.firebasestorage.app",
    appId: "1:912275465700:web:5ec12525e03446712153f1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// --- Authentication Functions ---
document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    try { 
        await signInWithEmailAndPassword(auth, email, pass); 
    } catch (e) {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await sendEmailVerification(res.user);
            alert("Verification email sent! Check your inbox.");
            await signOut(auth);
        } catch (err) { alert(err.message); }
    }
};

document.getElementById('googleBtn').onclick = async () => { 
    try { await signInWithPopup(auth, provider); } catch (e) { alert(e.message); } 
};

window.signOutUser = () => signOut(auth);

// --- Auth State Observer ---
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('authSection');
    const mainContent = document.getElementById('mainContent');
    const userHeader = document.getElementById('userHeader');

    if (user) {
        if (user.emailVerified || user.providerData[0].providerId === "google.com") {
            authSection.classList.add('auth-hidden');
            mainContent.classList.remove('auth-hidden');
            userHeader.classList.remove('auth-hidden');
            handlePoints(user);
            loadComments();
        } else {
            alert("Check Your Email for verification!");
            signOut(auth);
        }
    } else {
        authSection.classList.remove('auth-hidden');
        mainContent.classList.add('auth-hidden');
        userHeader.classList.add('auth-hidden');
    }
});

// --- Points Logic ---
async function handlePoints(user) {
    const userRef = ref(db, 'users/' + user.uid);
    const today = new Date().toISOString().split('T')[0];
    const snap = await get(userRef);
    const displayPoints = document.getElementById('displayPoints');
    const rewardMsg = document.getElementById('rewardMsg');

    if (snap.exists()) {
        const data = snap.val();
        displayPoints.textContent = (data.points || 0) + " PTS";
        if (data.lastLogin !== today) {
            const newTotal = (data.points || 0) + 5;
            await update(userRef, { points: newTotal, lastLogin: today });
            displayPoints.textContent = newTotal + " PTS";
            rewardMsg.classList.remove('hidden');
        }
    } else {
        await set(userRef, { points: 5, lastLogin: today, email: user.email });
        displayPoints.textContent = "5 PTS";
        rewardMsg.classList.remove('hidden');
    }
}

// --- Comments Logic ---
document.getElementById('postComment').onclick = () => {
    const input = document.getElementById('commentMsg');
    const text = input.value.trim();
    if(text) {
        push(ref(db, 'comments'), {
            user: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            text: text,
            timestamp: serverTimestamp()
        });
        input.value = "";
        // gtag is global from the HTML script
        if (typeof gtag === 'function') gtag('event', 'post_comment');
    }
};

function loadComments() {
    onValue(ref(db, 'comments'), (snap) => {
        const list = document.getElementById('commentList'); 
        list.innerHTML = "";
        const data = snap.val();
        if(data) {
            Object.values(data).reverse().forEach(c => {
                const div = document.createElement('div');
                div.className = "bg-slate-900/40 p-4 rounded-2xl border border-white/5";
                div.innerHTML = `<span class="text-blue-400 font-bold text-xs">${c.user}</span><p class="text-slate-300 text-sm mt-1">${c.text}</p>`;
                list.appendChild(div);
            });
        }
    });
}

// --- Particles Background ---
particlesJS("particles-js", { 
    "particles": { 
        "number": { "value": 50 }, 
        "color": { "value": "#3b82f6" }, 
        "move": { "enable": true, "speed": 1 } 
    } 
});
