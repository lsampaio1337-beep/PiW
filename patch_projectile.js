const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const projectileFns = `
export function playAttackAnimation(attackerSide) {
    const elId = attackerSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const el = document.getElementById(elId);
    if (!el) return;

    // Briefly remove idle anim during attack
    const idleClasses = Array.from(el.classList).filter(c => c.startsWith('anim-idle-'));
    el.classList.remove(...idleClasses);

    const attackClass = attackerSide === 'player' ? 'anim-attack' : 'anim-attack-enemy';
    el.classList.remove(attackClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(attackClass);

    setTimeout(() => {
        el.classList.remove(attackClass);
        if (idleClasses.length) el.classList.add(...idleClasses);
    }, 500);
}

export function playAttackedAnimation(defenderSide) {
    const elId = defenderSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const el = document.getElementById(elId);
    if (!el) return;

    const attackedClass = defenderSide === 'player' ? 'anim-attacked' : 'anim-attacked-enemy';
    el.classList.remove(attackedClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(attackedClass);

    setTimeout(() => {
        el.classList.remove(attackedClass);
    }, 400);
}

export function shootProjectile(attackerSide, moveType, onImpactCallback) {
    const color = TYPE_COLORS[moveType] || '#ffffff';

    const startId = attackerSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const targetId = attackerSide === 'player' ? 'enemy-sprite' : 'player-sprite';

    const startEl = document.getElementById(startId);
    const targetEl = document.getElementById(targetId);

    if (!startEl || !targetEl) {
        if(onImpactCallback) onImpactCallback();
        return;
    }

    const arena = document.getElementById('combat-arena');
    if (!arena) {
        if(onImpactCallback) onImpactCallback();
        return;
    }

    const startRect = startEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();

    const startX = startRect.left - arenaRect.left + startRect.width / 2;
    const startY = startRect.top - arenaRect.top + startRect.height / 2;

    const endX = targetRect.left - arenaRect.left + targetRect.width / 2;
    const endY = targetRect.top - arenaRect.top + targetRect.height / 2;

    const projectile = document.createElement('div');
    projectile.style.position = 'absolute';
    projectile.style.width = '16px';
    projectile.style.height = '16px';
    projectile.style.borderRadius = '50%';
    projectile.style.backgroundColor = color;
    projectile.style.boxShadow = \`0 0 10px \${color}, 0 0 20px \${color}\`;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';
    projectile.style.transform = 'translate(-50%, -50%)';
    projectile.style.zIndex = '100';
    projectile.style.transition = 'left 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';

    arena.appendChild(projectile);

    // Start animation next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            projectile.style.left = endX + 'px';
            projectile.style.top = endY + 'px';
        });
    });

    setTimeout(() => {
        if (projectile.parentElement) projectile.parentElement.removeChild(projectile);
        playSplash(targetX, targetY, color, arena);
        if(onImpactCallback) onImpactCallback();
    }, 400);

    const targetX = endX;
    const targetY = endY;
}

function playSplash(x, y, color, parent) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.zIndex = '99';
        particle.style.transition = 'all 0.3s ease-out';

        parent.appendChild(particle);

        const angle = (Math.PI * 2 / 8) * i;
        const distance = 30 + Math.random() * 20;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                particle.style.transform = \`translate(\${Math.cos(angle) * distance}px, \${Math.sin(angle) * distance}px) scale(0)\`;
                particle.style.opacity = '0';
            });
        });

        setTimeout(() => {
            if (particle.parentElement) particle.parentElement.removeChild(particle);
        }, 300);
    }
}
`;

battleJs += '\n' + projectileFns;

// Update showDamage text fade
const oldShowDamageFade = `    // Animate up and fade out
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
        dmgNode.style.opacity = '0';
    }, 50);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 1000);`;

const newShowDamageFade = `    // Animate up
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
    }, 50);

    // Keep 100% opacity for 2 seconds, then fade out over 1 second
    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2050);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3050);`;

battleJs = battleJs.replace(oldShowDamageFade, newShowDamageFade);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Projectile fns added!');
