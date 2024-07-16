const climasSection = document.querySelector(".climas");
const apiURL = "https://api.gael.cloud/general/public/clima";

async function getClimas() {
    const res = await fetch(apiURL);
    const climas = await res.json();
    return climas;
};


async function renderClimas() {
    const climas = await getClimas();
    let template = "";
    climas.forEach((clima) => {
    template += `
    <div class="clima">
    <h3>${clima.Estacion}</h3>
    <p>${clima.Temp}°C</p>
    </div>
    `;
    });
    climasSection.innerHTML = template;
};
renderClimas();