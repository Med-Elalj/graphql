import { Profile, Data } from "./graph.js";

window.data = new Data();
const profile = new Profile()


async function loadPage() {
    await profile.response;
    profile.response.then( () => {
        let total_audit = Number(profile.auditsSucceeded) + Number(profile.auditsFailed)
        displayof_Name.innerHTML = profile.firstName+" "+profile.lastName;
        displayof_Name.title = profile.login;
        displayof_audit_ratio.innerHTML = profile.auditRatio;
        displayof_audit_total.innerHTML = total_audit;
        displayof_audit_successRate.innerHTML = Math.round((Number(profile.auditsSucceeded) / total_audit)*1000)/10;
        displayof_audit_failRate.innerHTML = Math.round((Number(profile.auditsFailed) / total_audit)*1000)/10;
        displayof_level.innerHTML = profile.level;
    });
    await window.data.response
    window.data.response.then(
        displayof_last_transactions.innerHTML = window.data.renderTransactions()
    );
};

displayof_login.toggle = () => { displayof_login.style.display = displayof_login.style.display == "none" ? "" : "none" }
function login(event) {
    const form = event.target
    e.preventDefault()
    const credentials = {
        username: form?.username.value,
        password: form?.password.value,
    }
    try {
        const response = () => {
            const response = fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${btoa(credentials.username + ":" + credentials.password)}`
                }
            });
            return response.then(res => res.json());
        }
        if (response.error) {
            throw response.error;
        }
        localStorage.setItem('JWT', response);
        displayof_login.toggle();
        loadPage();
    } catch (error) {
        alert(error)
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("token") == "") {
    } else {
        displayof_login.toggle()
        loadPage();
    }
});
