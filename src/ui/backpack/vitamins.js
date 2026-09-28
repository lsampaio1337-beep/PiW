export function renderVitaminsTab(area) {
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; align-items: center;">
            <h3 style="text-align: center; margin-top: 0; color: #ddd;">This pocket is empty.</h3>
        </div>
    `;

    area.innerHTML = content;
}
