import { Profile, Data } from "./graph.js";

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

function calcCoordinates(Nsides, radius) {
    const angle = Math.PI / (Nsides / 2);
    let coord = [];
    for (let i = 0; i < Nsides; i++) {
        const x = Math.round(radius * Math.cos(angle * i));
        const y = Math.round(radius * Math.sin(angle * i));
        // console.log(i,x,y,radius * Math.cos(angle * i))
        coord.push({ x: x, y: y });
    };

    // console.log("coord",coord , Nsides,radius)
    return coord;

};

// Function to update the SVG polygon based on skill values
function renderGraph(skills) {
    let res = calcCoordinates(skills.length, 60).map(item => {
        return `<line x1="0" y1="0" x2="${item.x}" y2="${item.y}" stroke="#cce" stroke-width="2" />\n`;
    }).join(' ');
    let coord = [20, 40, 60, 80, 100].forEach(r => {
        let points = calcCoordinates(skills.length, 60 * r / 100).map(item => `${item.x},${item.y}`).join(' ');
        res += `<polygon class="polygon" points="${points}" stroke="#ccc" fill="none"/>\n`
    })

    const polygon = document.getElementById("skill-polygon");
    const labelcoord = calcCoordinates(skills.length, 78)
    let last = '';
    const points = skills.map((skill, index) => {
        let c = calcCoordinates(skills.length, 60 * skill.level / 100)[index];
        last += `<circle onhover="console.log("test")" cx="${c.x}" cy="${c.y}" r="3" fill="red" ><title>${skill.name} : ${skill.level}</title></circle>\n`;
        last += `<text x="${labelcoord[index].x}" y="${labelcoord[index].y}" text-anchor="middle" fill="red" dominant-baseline="central"  font-size="9px"><title>${skill.name} : ${skill.level}</title>${skill.name}</text>\n`
        return `${c.x},${c.y}`;
    }).join(" ");
    
    res += `<polygon id="skill-polygon" points="${points}" fill="rgba(0,123,255,0.5)" stroke="#007bff" stroke-width="2" />\n`+last
    return `<svg id="skills-graph" width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(100,100)" id="graph_display">${res}</g>
        </svg>`
}

function module(projects) {
    // { xp: 5000, project: "go-reloaded", createdAt: "2024-04-29T12:19:33.931771+00:00" }
    const start = new Date(projects[0].createdAt)
    const long = new Date(projects[projects.length-1].createdAt) -start
    const toPersent = (date) => {
        return ((date - start)/long)*1000
    }
    let xp = 0;
    const maxXp = projects.reduce((sum, item) => sum + item.xp, 0);
    let res ="";
    let last ="";
    let points = "0,0";
    projects.forEach((project) => {
        xp += project.xp
        let x = toPersent(new Date(project.createdAt));
        let y = (xp/maxXp)*1000;
        console.log(x,y ,project,maxXp,(xp/maxXp),xp,(xp/maxXp)*350)
        last += `<circle  cx="${x}" cy="${y}" r="5" fill="red" ><title>${project.project} : ${project.xp  }  PUSHED AT: ${new Date(project.createdAt).toLocaleDateString()}</title></circle>\n`;
        points +=` ${x},${y} `
    });
    points += "1000,0"
    res += `<polygon id="skill-polygon" points="${points}" fill="rgba(0,123,255,0.5)" stroke="#007bff" stroke-width="5" />\n`
    displayof_module_nodata.innerHTML = ""
    displayof_module_number_5.innerHTML = Math.round(maxXp/5)>1000?Math.round((maxXp/5)/1000)+ " KB":Math.round(maxXp/5) +" B";
    displayof_module_number_4.innerHTML = Math.round(maxXp/4)>1000?Math.round((maxXp/4)/1000)+ " KB":Math.round(maxXp/4) +" B";
    displayof_module_number_3.innerHTML = Math.round(maxXp/3)>1000?Math.round((maxXp/3)/1000)+ " KB":Math.round(maxXp/3) +" B";
    displayof_module_number_2.innerHTML = Math.round(maxXp/2)>1000?Math.round((maxXp/2)/1000)+ " KB":Math.round(maxXp/2) +" B";
    displayof_module_number_1.innerHTML = Math.round(maxXp/1)>1000?Math.round((maxXp/1)/1000)+ " KB":Math.round(maxXp/1) +" B";
    displayof_module_number_0.innerHTML = "0 B";
    return res+last
}

async function loadPage() {
    const data = await new Data().init();
    const profile = await new Profile().init();
    console.log("data", data)
    console.log("profile", profile)

    displayof_module_graph.innerHTML = module(data.projects)
    window.projects = data.projects
    if (data.skills < 10 ) {
        graph_display.innerTML = renderGraph(skills)
    } else {
        let d1 = data.skills.slice(0, Math.floor(data.skills.length / 2));
        let d2 = data.skills.slice(Math.floor(data.skills.length / 2));
        graph_display.innerHTML = renderGraph(d1)+renderGraph(d2)
    }

    let total_audit = Number(profile.auditsSucceeded) + Number(profile.auditsFailed)

    displayof_Name.innerHTML = profile.firstName + " " + profile.lastName;
    displayof_Name.title = profile.login;
    displayof_audit_ratio.innerHTML = profile.auditRatio;
    displayof_audit_total.innerHTML = total_audit;
    displayof_audit_successRate.innerHTML = Math.round((Number(profile.auditsSucceeded) / total_audit) * 1000) / 10;
    displayof_audit_failRate.innerHTML = Math.round((Number(profile.auditsFailed) / total_audit) * 1000) / 10;
    displayof_level.innerHTML = profile.level;

    displayof_last_transactions.innerHTML = data.renderTransactions()
};

displayof_login.toggle = () => { displayof_login.style.display = displayof_login.style.display == "none" ? "" : "none" }
const AUTH_URL = 'https://learn.zone01oujda.ma/api/auth/signin'

document.addEventListener('DOMContentLoaded', () => {

    logout_btn.addEventListener('click', () => logout())

    login_form.addEventListener("submit", (event) => {
        event.preventDefault()
        const credentials = {
            username: login_form?.username.value,
            password: login_form?.password.value,
        }
        try {
            fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${btoa(credentials.username + ":" + credentials.password)}`
                }
            }).then(res => {
                if (res.error) {
                    throw res.error;
                }
                res.json().then(token => {
                    console.log("test", token)

                    localStorage.setItem('token', token);
                    loadPage();
                    displayof_login.toggle();
                })
            }).then(data => { console.log("data", data) });
        } catch (error) {
            alert(error.message)
        }
        console.log("logged in")
    });
    if (localStorage.getItem("token") !== null) {
        displayof_login.toggle()
        loadPage();
    }
});
