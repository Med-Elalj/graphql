import { Profile, Data } from "./graph.js";

export function logout() {
    localStorage.removeItem('token');

    displayof_Name.innerHTML = "FirstName LastName";
    displayof_Name.title = "NickName";
    displayof_audit_ratio.innerHTML = 0;
    displayof_audit_total.innerHTML = 0;
    displayof_audit_successRate.innerHTML = '0 %';
    displayof_audit_failRate.innerHTML = '0 %';
    displayof_level.innerHTML = 0;

    displayof_last_transactions.innerHTML = '';

    displayof_module_time.innerHTML = '';
    displayof_module_graph.innerHTML = '';
    displayof_module_nodata.innerHTML = "No Data Yet";
    displayof_graph_display.innerHTML = `<svg id="dispalyof_module" width="900" height="450" viewBox="0 0 900 450"
                xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#333" />
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="7em" fill="#888">
                    No data yet
                </text>
            </svg>`;
    document.querySelectorAll('[id^="displayof_module_number"]').forEach((e) => { e.innerHTML = '' });
    displayof_login.style.display = '';
    console.log("logged out")
}

function calcCoordinates(Nsides, radius) {
    const angle = Math.PI / (Nsides / 2);
    let coord = [];
    for (let i = 0; i < Nsides; i++) {
        const x = Math.round(radius * Math.cos(angle * i));
        const y = Math.round(radius * Math.sin(angle * i));
        coord.push({ x: x, y: y });
    };
    return coord;

};

// Function to update the SVG polygon based on skill values
function renderGraph(skills) {
    let res = calcCoordinates(skills.length, 600).map(item => {
        return `<line x1="0" y1="0" x2="${item.x}" y2="${item.y}" stroke="var(--black)" stroke-width="5" />\n`;
    }).join(' ');
    let coord = [20, 40, 60, 80, 100].forEach(r => {
        let points = calcCoordinates(skills.length, 600 * r / 100).map(item => `${item.x},${item.y}`).join(' ');
        res += `<polygon class="polygon" points="${points}" stroke="var(--black)" fill="none"/>\n`
    })

    const polygon = document.getElementById("skill-polygon");
    const labelcoord = calcCoordinates(skills.length, 780)
    let last = '';
    const points = skills.map((skill, index) => {
        let c = calcCoordinates(skills.length, 600 * skill.level / 100)[index];
        last += `<circle onhover="console.log("test")" cx="${c.x}" cy="${c.y}" r="15" fill="green" ><title>${skill.name} : ${skill.level}</title></circle>\n`;
        last += `<text x="${labelcoord[index].x}" y="${labelcoord[index].y}" text-anchor="middle" fill="var(--black)" dominant-baseline="central"  font-size="4em"><title>${skill.name} ${skill.level}%</title>${skill.name}</text>\n`
        return `${c.x},${c.y}`;
    }).join(" ");

    res += `<polygon id="skill-polygon" points="${points}" fill="var(--graphcolor)" stroke="#007bff" stroke-width="2" />\n` + last
    return `<svg id="skills-graph" width="400" height="400" viewBox="0 0 2000 2000" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(1000,1000)">${res}</g>
        </svg>`
}

function module(projects) {
    // { xp: 5000, project: "go-reloaded", createdAt: "2024-04-29T12:19:33.931771+00:00" }
    const start = new Date(projects[0].createdAt)
    const long = new Date(projects[projects.length - 1].createdAt) - start
    const toPersent = (date) => {
        return ((date - start) / long) * 1000
    }
    let xp = 0;
    const maxXp = projects.reduce((sum, item) => sum + item.xp, 0);
    let res = "";
    let last = "";
    let points = "0,0";
    projects.forEach((p) => {
        xp += p.xp
        let x = toPersent(new Date(p.createdAt));
        let y = (xp / maxXp) * 1000;
        last += `<circle  cx="${x}" cy="${y}" r="5" fill="var(--black)" ><title>${p.project}  ${(p.xp > 9999 ? (p.xp / 1000).toFixed(0) + " KB" : p.xp + "B") || "couldn't get xp"
            }  Pushed at: ${new Date(p.createdAt).toLocaleDateString()}</title></circle>\n`;
        points += ` ${x},${y} `
    });
    points += "1000,0"
    res += `<polygon id="skill-polygon" points="${points}" fill="var(--graphcolor)" stroke="#007bff" stroke-width="5" />\n`
    displayof_module_number_0.innerHTML = "0 B";
    displayof_module_number_1.innerHTML = (maxXp / 5).toFixed(0) > 999 ? ((maxXp / 5) / 1000).toFixed(0) + " KB" : (maxXp / 5).toFixed(0) + " B";
    displayof_module_number_2.innerHTML = (maxXp / 4).toFixed(0) > 999 ? ((maxXp / 4) / 1000).toFixed(0) + " KB" : (maxXp / 4).toFixed(0) + " B";
    displayof_module_number_3.innerHTML = (maxXp / 3).toFixed(0) > 999 ? ((maxXp / 3) / 1000).toFixed(0) + " KB" : (maxXp / 3).toFixed(0) + " B";
    displayof_module_number_4.innerHTML = (maxXp / 2).toFixed(0) > 999 ? ((maxXp / 2) / 1000).toFixed(0) + " KB" : (maxXp / 2).toFixed(0) + " B";
    displayof_module_number_5.innerHTML = (maxXp / 1).toFixed(0) > 999 ? ((maxXp / 1) / 1000).toFixed(0) + " KB" : (maxXp / 1).toFixed(0) + " B";
    return res + last
}

async function loadPage() {
    const graph = await new Data().init();
    const profile = await new Profile().init();
    console.log("graph", graph)
    console.log("profile", profile)

    if (graph) {
        displayof_module_nodata.innerHTML = ""
        displayof_module_time.innerHTML = `${graph.moduleStartAt.toLocaleDateString()} -> ${graph.moduleEndAt.toLocaleDateString()}`
        displayof_module_graph.innerHTML = module(graph.projects)
        if (graph.skills < 10) {
            displayof_graph_display.innerHTML = renderGraph(skills)
        } else {
            let d1 = graph.skills.slice(0, Math.floor(graph.skills.length / 2));
            let d2 = graph.skills.slice(Math.floor(graph.skills.length / 2));
            displayof_graph_display.innerHTML = renderGraph(d1) + renderGraph(d2)
        }
        displayof_last_transactions.innerHTML = graph.renderTransactions()
    }
    if (profile) {

        let total_audit = Number(profile.auditsSucceeded) + Number(profile.auditsFailed)

        displayof_Name.innerHTML = profile.firstName + " " + profile.lastName || "Name";
        displayof_Name.title = profile.login || "Name";
        displayof_audit_ratio.innerHTML = profile.auditRatio.toFixed(2) || "audit_ratio";
        displayof_audit_total.innerHTML = total_audit || "audit_total";
        displayof_audit_successRate.innerHTML = ((profile.auditsSucceeded / total_audit) * 100).toFixed(1) + "%" || "audit_successRate";
        displayof_audit_failRate.innerHTML = ((profile.auditsFailed / total_audit) * 100).toFixed(1) + "%" || "audit_failRate";
        displayof_level.innerHTML = profile.level || "level";
    }

};

const AUTH_URL = 'https://learn.zone01oujda.ma/api/auth/signin'

document.addEventListener('DOMContentLoaded', () => {

    logout_btn.addEventListener('click', () => logout())

    login_form.addEventListener("submit", async (event) => {
        event.preventDefault()
        const credentials = {
            username: login_form?.username.value,
            password: login_form?.password.value,
        }
        try {
            const res = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${btoa(credentials.username + ":" + credentials.password)}`
                }
            });

            if (!res.ok) {
                console.log(res)
                const resBody = await res.json();
                throw new Error('Failed to log in\n' + (resBody.error || ''));
            }

            const token = await res.json();

            // Check if token contains an error
            if (token.error) {
                throw new Error(token.error);
            }

            // Save the token and handle successful login
            localStorage.setItem('token', token);
            loadPage();
            displayof_login.style.display = 'none';

        } catch (error) {
            alert(error.message);
        }
        console.log("logged in")
    });
    if (localStorage.getItem("token") !== null) {
        displayof_login.style.display = 'none';
        loadPage();
    }
});
