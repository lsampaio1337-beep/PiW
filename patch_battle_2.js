<<<<<<< SEARCH
            const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
            if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';

            const elEnemySprite = document.getElementById('enemy-sprite');
            const elEnemySide = document.getElementById('enemy-side');
            if (elEnemySprite && elEnemySide) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                elEnemySide.style.transition = 'none';
                elEnemySide.style.left = '35%'; // Matching active battle destination
                elEnemySide.style.bottom = '10%'; // default
            }
=======
            const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
            if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';

            const elEnemySprite = document.getElementById('enemy-sprite');
            const elEnemySide = document.getElementById('enemy-side');
            const enemySplash = document.getElementById('enemy-water-splash');
            if (elEnemySprite && elEnemySide) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                elEnemySprite.className = '';
                if (enemySplash) enemySplash.style.display = 'none';
                elEnemySide.style.transition = 'none';
                elEnemySide.style.left = '35%'; // Matching active battle destination
                elEnemySide.style.bottom = '10%'; // default
            }
>>>>>>> REPLACE
