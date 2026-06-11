
    /* ============================================
       PRESET DATA
       ============================================ */
    const DEFAULT_PLAYERS = [
        "鍔犻€?, "Rebel", "Kohana", "鏂?,
        "鐜勭櫧", "灏忛瓌", "闃胯彍", "涓夌櫨鏂よ悵鍗?,
        "浣畫", "绌烘灉", "Furikiri", "aofu",
        "瑙掍父", "瀹囧畽", "鍙伓", "绾冲姪"
    ];

    const DEFAULT_G_POOL = [
        { name: "鑲叉ū", max: 2 },
        { name: "绾㈡ū", max: 2 },
        { name: "澶╃嫾鏄?, max: 2 },
        { name: "涔濆惞闆?, max: 2 },
        { name: "el", max: 2 },
        { name: "鍔?, max: 2 },
        { name: "鐓屽垁", max: 2 },
        { name: "闆疯泧", max: 2 },
        { name: "Muramasa", max: 2 },
        { name: "杩?, max: 2 },
        { name: "鐐?, max: 2 },
        { name: "鍐?, max: 2 },
        { name: "椋?, max: 2 },
        { name: "鍏?, max: 2 },
        { name: "鏆?, max: 2 },
        { name: "绌?, max: 2 }
    ];

    const DEFAULT_SONGS = [
        "AnythingGoes! (TV Size)", "Burning Heart!", "Catalyst", "Cobalt",
        "Deja Vu", "Eternal Flame", "Flyers!!!", "Gira Gira",
        "Heavenly Blue", "Ignite", "Journey", "Kakumei",
        "Luminous", "Magnetic", "No Limit", "Outrage"
    ];

    /* ============================================
       STATE MACHINE
       ============================================ */
    const Phase = {
        CONFIG: 'CONFIG',
        ROUND_SHOW: 'ROUND_SHOW',
        MATCH_DRAW: 'MATCH_DRAW',
        SONG_DRAW: 'SONG_DRAW',
        G_DRAW: 'G_DRAW',
        FINAL_SHOW: 'FINAL_SHOW'
    };

    const state = {
        currentPhase: Phase.CONFIG,
        players: [...DEFAULT_PLAYERS],
        gPool: DEFAULT_G_POOL.map(g => ({ ...g, used: 0 })),
        songs: [...DEFAULT_SONGS],
        roundName: '',
        currentMatchIndex: 0,
        matches: [],           // Array of { player1, player2, song, g1, g2, firstAttack }
        currentDrawMatch: null, // The match currently being drawn
        currentGPlayer: null,  // Which player is selecting G (1 or 2)
        remainingPlayers: [],  // Players remaining to be paired
    };

    function transitionTo(newPhase) {
        // Hide all phase containers
        document.querySelectorAll('.phase-container').forEach(el => {
            el.classList.remove('active');
        });

        // Show the target phase
        const targetId = 'phase-' + newPhase.toLowerCase().replace('_', '-');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
        }

        state.currentPhase = newPhase;

        // Phase entry hooks
        switch (newPhase) {
            case Phase.CONFIG:
                onEnterConfig();
                break;
            case Phase.ROUND_SHOW:
                onEnterRoundShow();
                break;
            case Phase.MATCH_DRAW:
                onEnterMatchDraw();
                break;
            case Phase.SONG_DRAW:
                onEnterSongDraw();
                break;
            case Phase.G_DRAW:
                onEnterGDraw();
                break;
            case Phase.FINAL_SHOW:
                onEnterFinalShow();
                break;
        }
    }

    /* ============================================
       PHASE ENTRY HOOKS (stubs)
       ============================================ */
    function onEnterConfig() {
        initConfig();
    }

    function onEnterRoundShow() {
        const el = document.getElementById('round-show-name');
        el.textContent = state.roundName;
        el.style.animation = 'none';
        el.offsetHeight; // trigger reflow
        el.style.animation = '';
        setTimeout(() => transitionTo(Phase.MATCH_DRAW), 3000);
    }

    function onEnterMatchDraw() {
        const grid = document.getElementById('player-grid');
        grid.innerHTML = '';
        state.remainingPlayers.forEach((name, i) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.textContent = name;
            card.dataset.index = i;
            card.style.animationDelay = (i * 0.05) + 's';
            grid.appendChild(card);
        });
        // Reset draw UI
        document.getElementById('draw-status').textContent = 'READY';
        document.getElementById('draw-status').classList.remove('matching');
        document.getElementById('btn-start-draw').style.display = '';
        document.getElementById('match-result').classList.remove('active');
        // Reset flying cards
        document.getElementById('flying-player-left').textContent = '';
        document.getElementById('flying-player-left').classList.remove('active');
        document.getElementById('flying-player-right').textContent = '';
        document.getElementById('flying-player-right').classList.remove('active');
        document.getElementById('slot-machine').classList.remove('active');
    }

    let songSlotInterval = null;
    function onEnterSongDraw() {
        const display = document.getElementById('song-slot-display');
        display.classList.add('spinning');
        songSlotInterval = setInterval(() => {
            const randomSong = state.songs[Math.floor(Math.random() * state.songs.length)];
            display.textContent = randomSong;
        }, 80);
        document.getElementById('btn-stop-song').style.display = '';
    }

    function onEnterGDraw() {
        const grid = document.getElementById('g-draw-grid');
        grid.innerHTML = '';
        state.gPool.forEach((g, index) => {
            const item = document.createElement('div');
            item.className = 'g-draw-item';
            if (g.used >= g.max) item.classList.add('depleted');
            item.dataset.index = index;
            item.innerHTML = `
                <div class="g-draw-name">${escapeHtml(g.name)}</div>
                <div class="g-draw-count">${g.used}/${g.max}</div>
            `;
            grid.appendChild(item);
        });
        const playerName = state.currentGPlayer === 1 
            ? state.currentDrawMatch.player1 
            : state.currentDrawMatch.player2;
        document.getElementById('g-draw-player-name').textContent = playerName;
    }

    function onEnterFinalShow() {
        const m = state.currentDrawMatch;
        document.getElementById('final-round').textContent = state.roundName;
        document.getElementById('final-player1').textContent = m.player1;
        document.getElementById('final-player2').textContent = m.player2;
        document.getElementById('final-song').textContent = m.song;
        document.getElementById('final-g1').textContent = m.g1 || '-';
        document.getElementById('final-g2').textContent = m.g2 || '-';
        document.getElementById('final-first-attack').textContent = m.firstAttack === 1 ? m.player1 : m.player2;
        // Animate entrance
        const panel = document.getElementById('final-panel');
        panel.style.animation = 'none';
        panel.offsetHeight;
        panel.style.animation = '';
    }

    /* ============================================
       CANVAS BACKGROUND ANIMATION
       ============================================ */
    (function initCanvasBackground() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animFrameId;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.hue = Math.random() > 0.7 ? 340 : 280; // red or purple
                this.life = Math.random() * 200 + 100;
                this.maxLife = this.life;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;

                if (this.life <= 0 || this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
                    this.reset();
                }
            }

            draw() {
                const fadeRatio = this.life / this.maxLife;
                const alpha = this.opacity * fadeRatio;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${alpha})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(Math.floor((width * height) / 8000), 200);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function drawFluidGradient(time) {
            // Animated gradient background
            const t = time * 0.0003;

            // Base gradient
            const grad = ctx.createLinearGradient(0, 0, width, height);
            const angle = Math.sin(t) * 0.3;
            const x1 = width * (0.5 + Math.sin(t) * 0.3);
            const y1 = height * (0.5 + Math.cos(t * 0.7) * 0.3);
            const x2 = width * (0.5 + Math.cos(t * 0.8) * 0.3);
            const y2 = height * (0.5 + Math.sin(t * 0.6) * 0.3);

            const g = ctx.createLinearGradient(x1, y1, x2, y2);
            g.addColorStop(0, '#0a0010');
            g.addColorStop(0.3, '#1a0a2e');
            g.addColorStop(0.6, '#0d0520');
            g.addColorStop(1, '#0a0010');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);

            // Flowing glow blobs
            drawGlowBlob(
                width * (0.3 + Math.sin(t * 0.5) * 0.2),
                height * (0.4 + Math.cos(t * 0.3) * 0.2),
                Math.max(200, width * 0.25),
                'rgba(255, 45, 85, 0.03)',
                'rgba(255, 45, 85, 0)'
            );

            drawGlowBlob(
                width * (0.7 + Math.cos(t * 0.4) * 0.15),
                height * (0.6 + Math.sin(t * 0.6) * 0.15),
                Math.max(250, width * 0.3),
                'rgba(100, 40, 180, 0.04)',
                'rgba(100, 40, 180, 0)'
            );

            drawGlowBlob(
                width * (0.5 + Math.sin(t * 0.7) * 0.25),
                height * (0.3 + Math.cos(t * 0.5) * 0.2),
                Math.max(180, width * 0.2),
                'rgba(255, 107, 138, 0.02)',
                'rgba(255, 107, 138, 0)'
            );
        }

        function drawGlowBlob(x, y, radius, colorInner, colorOuter) {
            radius = Math.max(1, radius);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, colorInner);
            grad.addColorStop(1, colorOuter);
            ctx.fillStyle = grad;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }

        function drawConnections() {
            const maxDist = 120;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 107, 138, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate(time) {
            ctx.clearRect(0, 0, width, height);

            drawFluidGradient(time);

            // Update and draw particles
            for (const p of particles) {
                p.update();
                p.draw();
            }

            drawConnections();

            animFrameId = requestAnimationFrame(animate);
        }

        // Initialize
        resize();
        initParticles();
        animate(0);

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });
    })();

    /* ============================================
       CONFIG INITIALIZATION
       ============================================ */
    function initConfig() {
        // Populate players textarea
        const playersInput = document.getElementById('players-input');
        playersInput.value = state.players.join('\n');

        // Populate songs textarea
        const songsInput = document.getElementById('songs-input');
        songsInput.value = state.songs.join('\n');

        // Populate G-pool config grid
        renderGPoolConfig();

        // Set round name
        const roundInput = document.getElementById('round-name-input');
        roundInput.value = state.roundName || '';

        // Update counts
        updateConfigCounts();
    }

    function renderGPoolConfig() {
        const grid = document.getElementById('g-pool-config-grid');
        grid.innerHTML = '';

        state.gPool.forEach((g, index) => {
            const item = document.createElement('div');
            item.className = 'g-pool-item';
            item.innerHTML = `
                <div class="g-name">${escapeHtml(g.name)}</div>
                <div class="g-max">
                    <label>MAX</label>
                    <input type="number" class="g-max-input" value="${g.max}" min="0" max="10" data-index="${index}">
                </div>
            `;
            grid.appendChild(item);
        });

        // Listen for max changes
        grid.querySelectorAll('.g-max-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = parseInt(e.target.value) || 0;
                state.gPool[idx].max = Math.max(0, Math.min(10, val));
            });
        });
    }

    function updateConfigCounts() {
        const playersText = document.getElementById('players-input').value.trim();
        const playerNames = playersText ? playersText.split('\n').filter(n => n.trim()) : [];
        document.getElementById('player-count').textContent = playerNames.length;
        document.getElementById('footer-player-count').textContent = playerNames.length;

        const songsText = document.getElementById('songs-input').value.trim();
        const songNames = songsText ? songsText.split('\n').filter(n => n.trim()) : [];
        document.getElementById('song-count').textContent = songNames.length;

        document.getElementById('g-pool-count').textContent = state.gPool.length;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ============================================
       EVENT LISTENERS
       ============================================ */
    // Config textarea changes
    document.getElementById('players-input').addEventListener('input', updateConfigCounts);
    document.getElementById('songs-input').addEventListener('input', updateConfigCounts);

    // Start tournament button
    document.getElementById('btn-start-tournament').addEventListener('click', () => {
        // Parse config
        const playersText = document.getElementById('players-input').value.trim();
        state.players = playersText ? playersText.split('\n').map(n => n.trim()).filter(n => n) : [];

        const songsText = document.getElementById('songs-input').value.trim();
        state.songs = songsText ? songsText.split('\n').map(n => n.trim()).filter(n => n) : [];

        state.roundName = document.getElementById('round-name-input').value.trim() || '姣旇禌';

        // Reset G pool usage
        state.gPool.forEach(g => g.used = 0);

        // Auto-save state
        localStorage.setItem('wotagei-tournament-state', JSON.stringify({
            players: state.players,
            gPool: state.gPool,
            songs: state.songs,
            roundName: state.roundName
        }));

        // Generate match pairings
        state.remainingPlayers = [...state.players];
        shuffleArray(state.remainingPlayers);
        state.currentMatchIndex = 0;
        state.matches = [];

        // Reset footer match count
        document.getElementById('footer-match-count').textContent = '0';

        transitionTo(Phase.ROUND_SHOW);
    });

    // Start draw button
    document.getElementById('btn-start-draw').addEventListener('click', () => {
        if (state.remainingPlayers.length < 2) return;

        const btn = document.getElementById('btn-start-draw');
        btn.style.display = 'none';

        const status = document.getElementById('draw-status');
        status.textContent = 'MATCHING...';
        status.classList.add('matching');

        // Pick first player (fly out from grid)
        const firstIndex = Math.floor(Math.random() * state.remainingPlayers.length);
        const firstName = state.remainingPlayers[firstIndex];
        state.remainingPlayers.splice(firstIndex, 1);

        // Animate first player card
        const cards = document.querySelectorAll('.player-card');
        cards.forEach(c => {
            if (c.textContent === firstName) {
                c.classList.add('selected');
                setTimeout(() => {
                    const flyingLeft = document.getElementById('flying-player-left');
                    flyingLeft.textContent = firstName;
                    flyingLeft.classList.add('active');
                }, 500);
            }
        });

        // Start slot machine for second player
        setTimeout(() => {
            const slotMachine = document.getElementById('slot-machine');
            slotMachine.classList.add('active');

            const slotDisplay = document.getElementById('slot-display');
            let slotInterval = setInterval(() => {
                const randomName = state.remainingPlayers[Math.floor(Math.random() * state.remainingPlayers.length)];
                slotDisplay.textContent = randomName;
            }, 60);

            // Stop after 2.5 seconds
            setTimeout(() => {
                clearInterval(slotInterval);
                const secondIndex = Math.floor(Math.random() * state.remainingPlayers.length);
                const secondName = state.remainingPlayers[secondIndex];
                state.remainingPlayers.splice(secondIndex, 1);

                slotDisplay.textContent = secondName;

                setTimeout(() => {
                    slotMachine.classList.remove('active');
                    const flyingRight = document.getElementById('flying-player-right');
                    flyingRight.textContent = secondName;
                    flyingRight.classList.add('active');

                    // Show VS result
                    setTimeout(() => {
                        const result = document.getElementById('match-result');
                        result.querySelector('.match-result-left').textContent = firstName;
                        result.querySelector('.match-result-right').textContent = secondName;
                        result.classList.add('active');

                        status.textContent = 'MATCH CONFIRMED';
                        status.classList.remove('matching');

                        // Create match object
                        state.currentDrawMatch = {
                            player1: firstName,
                            player2: secondName,
                            song: null,
                            g1: null,
                            g2: null,
                            firstAttack: null
                        };

                        // Auto transition to song draw after 2 seconds
                        setTimeout(() => transitionTo(Phase.SONG_DRAW), 2000);
                    }, 800);
                }, 300);
            }, 2500);
        }, 1000);
    });

    // Stop song button
    document.getElementById('btn-stop-song').addEventListener('click', () => {
        if (songSlotInterval) {
            clearInterval(songSlotInterval);
            songSlotInterval = null;
        }

        // Pick a random song (avoid repeats in this round)
        const availableSongs = state.songs.filter(s => !state.matches.some(m => m.song === s));
        const song = availableSongs.length > 0
            ? availableSongs[Math.floor(Math.random() * availableSongs.length)]
            : state.songs[Math.floor(Math.random() * state.songs.length)];

        const display = document.getElementById('song-slot-display');
        display.classList.remove('spinning');
        display.textContent = song;

        state.currentDrawMatch.song = song;
        document.getElementById('btn-stop-song').style.display = 'none';

        // Show selected song briefly, then transition to G draw
        setTimeout(() => {
            state.currentGPlayer = 1; // First player selects G
            transitionTo(Phase.G_DRAW);
        }, 1500);
    });

    // G-pool item clicks (delegated)
    document.getElementById('g-draw-grid').addEventListener('click', (e) => {
        const item = e.target.closest('.g-draw-item');
        if (!item || item.classList.contains('depleted')) return;

        const index = parseInt(item.dataset.index);
        const g = state.gPool[index];
        const playerName = state.currentGPlayer === 1
            ? state.currentDrawMatch.player1
            : state.currentDrawMatch.player2;

        // Show confirmation modal
        document.getElementById('g-confirm-text').textContent = `${playerName} 閫夋嫨浜?${g.name}`;
        document.getElementById('g-confirm-modal').classList.add('active');
        document.getElementById('g-confirm-modal').dataset.gIndex = index;
    });

    // G confirm modal
    document.getElementById('g-confirm-ok').addEventListener('click', () => {
        const modal = document.getElementById('g-confirm-modal');
        const gIndex = parseInt(modal.dataset.gIndex);
        const g = state.gPool[gIndex];

        // Record selection
        g.used++;
        if (state.currentGPlayer === 1) {
            state.currentDrawMatch.g1 = g.name;
            state.currentGPlayer = 2;
            modal.classList.remove('active');
            // Re-render G pool for second player
            onEnterGDraw();
        } else {
            state.currentDrawMatch.g2 = g.name;
            modal.classList.remove('active');
            // Both players selected, go to final show
            transitionTo(Phase.FINAL_SHOW);
        }
    });

    document.getElementById('g-confirm-cancel').addEventListener('click', () => {
        document.getElementById('g-confirm-modal').classList.remove('active');
    });

    // Next match button
    document.getElementById('btn-next-match').addEventListener('click', () => {
        // Save current match
        state.matches.push({ ...state.currentDrawMatch });
        state.currentMatchIndex++;

        // Update footer match count
        document.getElementById('footer-match-count').textContent = state.matches.length;

        if (state.remainingPlayers.length >= 2) {
            // More matches to draw
            transitionTo(Phase.MATCH_DRAW);
        } else {
            // Tournament complete for this round
            state.roundName = '姣旇禌缁撴潫';
            transitionTo(Phase.CONFIG);
        }
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    /* ============================================
       UTILITY FUNCTIONS
       ============================================ */
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* ============================================
       KEYBOARD SHORTCUTS
       ============================================ */
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (state.currentPhase === Phase.MATCH_DRAW) {
                document.getElementById('btn-start-draw').click();
            } else if (state.currentPhase === Phase.SONG_DRAW) {
                document.getElementById('btn-stop-song').click();
            }
        }
        if (e.code === 'Enter') {
            if (document.getElementById('g-confirm-modal').classList.contains('active')) {
                document.getElementById('g-confirm-ok').click();
            }
        }
        if (e.code === 'KeyF' && e.ctrlKey) {
            e.preventDefault();
            document.getElementById('btn-fullscreen').click();
        }
    });

    /* ============================================
       HISTORY PANEL
       ============================================ */
    document.getElementById('btn-history-toggle').addEventListener('click', () => {
        const panel = document.getElementById('history-panel');
        panel.classList.toggle('open');
        renderHistory();
    });

    function renderHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        state.matches.forEach((m, i) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-match">#${i + 1} ${escapeHtml(m.player1)} vs ${escapeHtml(m.player2)}</div>
                <div class="history-song">${escapeHtml(m.song || '-')}</div>
                <div class="history-g">G: ${escapeHtml(m.g1 || '-')} / ${escapeHtml(m.g2 || '-')}</div>
            `;
            list.appendChild(item);
        });
    }

    /* ============================================
       STAGE MODE TOGGLE
       ============================================ */
    document.getElementById('btn-stage-mode').addEventListener('click', () => {
        document.getElementById('app').classList.toggle('stage-mode');
    });

    /* ============================================
       INITIALIZATION
       ============================================ */
    function init() {
        initConfig();
        // Load from localStorage
        try {
            const saved = localStorage.getItem('wotagei-tournament-state');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.players) state.players = parsed.players;
                if (parsed.gPool) state.gPool = parsed.gPool;
                if (parsed.songs) state.songs = parsed.songs;
                if (parsed.roundName) state.roundName = parsed.roundName;
                initConfig();
            }
        } catch (e) {}
    }

    // Start the app
    init();
    
