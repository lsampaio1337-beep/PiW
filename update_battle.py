import re

with open('src/ui/battle.js', 'r') as f:
    content = f.read()

# Replace playCombatAnimations logic
pattern = re.compile(r"const atkRect = atkImg\.getBoundingClientRect\(\);(.*?)setTimeout\(\(\) => \{\n\s*clearInterval\(shakeInterval\);", re.DOTALL)

replacement = """const atkRect = atkImg.getBoundingClientRect();
    const defRect = defImg.getBoundingClientRect();
    const container = document.getElementById('battle-sprites-container') || document.body;

    let containerRect = container.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;

    if (container.offsetWidth) {
        scaleX = containerRect.width / container.offsetWidth;
        scaleY = containerRect.height / container.offsetHeight;
    }

    // Instead of vh, use the scale of the images to determine projectile size roughly
    const projHeight = (atkRect.height / scaleY) * 0.05;
    const projWidth = projHeight * 2;

    // Create projectile
    const proj = document.createElement('div');
    proj.style.position = container === document.body ? 'fixed' : 'absolute';
    proj.style.width = projWidth + 'px';
    proj.style.height = projHeight + 'px';
    proj.style.backgroundColor = color;
    proj.style.borderRadius = '5px';
    proj.style.boxShadow = `0 0 ${projHeight}px ${projHeight/2}px ${color}`;
    proj.style.zIndex = '999';
    proj.style.pointerEvents = 'none';
    proj.style.transform = 'translate(-50%, -50%)';

    // Start at attacker center
    const atkCenterX = atkRect.left + atkRect.width / 2;
    const atkCenterY = atkRect.top + atkRect.height / 2;
    const startX = container === document.body ? atkCenterX : (atkCenterX - containerRect.left) / scaleX;
    const startY = container === document.body ? atkCenterY : (atkCenterY - containerRect.top) / scaleY;

    // End at defender center
    const defCenterX = defRect.left + defRect.width / 2;
    const defCenterY = defRect.top + defRect.height / 2;
    const endX = container === document.body ? defCenterX : (defCenterX - containerRect.left) / scaleX;
    const endY = container === document.body ? defCenterY : (defCenterY - containerRect.top) / scaleY;

    proj.style.left = startX + 'px';
    proj.style.top = startY + 'px';

    container.appendChild(proj);

    // Animate projectile
    proj.style.transition = `all ${duration * 0.8}ms linear`;

    // Trigger reflow
    proj.getBoundingClientRect();

    proj.style.left = endX + 'px';
    proj.style.top = endY + 'px';

    setTimeout(() => {
        if (proj.parentElement) proj.parentElement.removeChild(proj);

        // Splash Effect
        const splash = document.createElement('div');
        splash.style.position = container === document.body ? 'fixed' : 'absolute';

        // Center the 0x0 div on the target
        splash.style.left = endX + 'px';
        splash.style.top = endY + 'px';
        splash.style.width = '0px';
        splash.style.height = '0px';
        splash.style.backgroundColor = color; // 100% solid color
        splash.style.borderRadius = '50%';
        splash.style.boxShadow = `0 0 ${projHeight}px ${projHeight/2}px ${color}`;
        splash.style.zIndex = '999';
        splash.style.pointerEvents = 'none';
        splash.style.transform = 'translate(-50%, -50%)';

        // Phase 1: Grow to 25% of sprite height
        splash.style.transition = `all ${duration * 0.15}ms linear`;

        container.appendChild(splash);

        // Trigger reflow
        splash.getBoundingClientRect();

        // Expand to 25% height of sprite from the center
        const sSize1 = (defRect.height / scaleY) * 0.25;
        splash.style.width = sSize1 + 'px';
        splash.style.height = sSize1 + 'px';
        splash.style.opacity = '1';

        // Phase 2: Grow to 50% height and fade out
        setTimeout(() => {
            splash.style.transition = `all ${duration * 0.15}ms linear`;
            const sSize2 = (defRect.height / scaleY) * 0.5;
            splash.style.width = sSize2 + 'px';
            splash.style.height = sSize2 + 'px';
            splash.style.opacity = '0';
        }, duration * 0.15);

        setTimeout(() => {
            if (splash.parentElement) splash.parentElement.removeChild(splash);
        }, duration * 0.3);

        // Defender Hit Animation (Shake) using transforms safely
        defImg.style.transition = 'transform 50ms ease-in-out';
        let shakeInterval = setInterval(() => {
            const shift = (Math.random() - 0.5) * 20;
            defImg.dataset.defTransform = `translateX(${shift}px)`;
            updateTransform(defImg);
        }, 50);

        setTimeout(() => {
            clearInterval(shakeInterval);"""

match = pattern.search(content)
if match:
    new_content = content[:match.start()] + replacement + content[match.end():]
    with open('src/ui/battle.js', 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed to find pattern")
