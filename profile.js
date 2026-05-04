import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// --- Profile Page Logic ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('displayEmail').textContent = user.email;
        
        // Fetch specific user data (points and name) from Database
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            const data = snap.val();
            if (data) {
                const name = data.displayName || user.displayName || user.email.split('@')[0];
                document.getElementById('displayUser').textContent = name;
                document.getElementById('userPoints').textContent = data.points || 0;
                document.getElementById('initials').textContent = name.substring(0, 2).toUpperCase();
            }
        });
    } else { 
        // If not logged in, send back to home page
        window.location.href = "index.html"; 
    }
});

// --- Update Name Function ---
document.getElementById('updateNameBtn').onclick = async () => {
    const newName = document.getElementById('newName').value.trim();
    if (newName.length > 2) {
        try {
            await updateProfile(auth.currentUser, { displayName: newName });
            await update(ref(db, 'users/' + auth.currentUser.uid), { displayName: newName });
            alert("Updated!");
            document.getElementById('newName').value = ""; // Clear input
        } catch (error) {
            alert("Error updating name: " + error.message);
        }
    } else {
        alert("Name must be at least 3 characters long.");
    }
};

// --- Logout Function ---
window.signOutUser = () => signOut(auth).then(() => {
    window.location.href = "index.html";
});
