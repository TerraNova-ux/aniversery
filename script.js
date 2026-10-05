(() => {
  'use strict';

  /* =========================================================
     CHERIVELLE — OUR STORY
     Main story controller
     ========================================================= */

  const screens = [...document.querySelectorAll('.screen')];
  const progress = document.getElementById('progressBar');
  const storyBack = document.getElementById('storyBack');
  const storyNext = document.getElementById('storyNext');
  const storyCount = document.getElementById('storyCount');

  let current = 'home';

  const routes = {
    home: 'hub',
    hub: 'timeline',
    timeline: 'memories',
    memories: 'why',
    why: 'song',
    song: 'future',
    future: 'letter',
    letter: 'final',
    final: 'home'
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function updateProgress(target) {
    const index = screens.findIndex(screen => screen.id === target.id);

    const percent =
      index <= 0
        ? 0
        : (index / Math.max(1, screens.length - 1)) * 100;

    if (progress) {
      progress.style.width = `${percent}%`;
    }

    const step = String(index + 1).padStart(2, '0');
    const total = String(screens.length).padStart(2, '0');

    if (storyCount) {
      storyCount.textContent = `${step} / ${total}`;
    }

    const previous =
      index > 0
        ? screens[index - 1].id
        : null;

    const next = routes[target.id] || null;

    if (storyBack) {
      storyBack.disabled = !previous;
      storyBack.setAttribute(
        'aria-label',
        previous
          ? `Go back to ${previous}`
          : 'No previous chapter'
      );
    }

    if (storyNext) {
      storyNext.disabled = !next;
      storyNext.setAttribute(
        'aria-label',
        next
          ? `Go to ${next}`
          : 'No next chapter'
      );
    }
  }

  function go(id, push = false) {
    const target = document.getElementById(id);

    if (!target) {
      console.warn(`Cherivelle: screen "${id}" not found.`);
      return;
    }

    screens.forEach(screen => {
      const active = screen === target;

      screen.classList.toggle('active', active);
      screen.setAttribute(
        'aria-hidden',
        active ? 'false' : 'true'
      );
    });

    current = id;
    document.body.dataset.screen = id;

    updateProgress(target);

    /*
      Reset BOTH the page and the active screen.
      This prevents the user from arriving halfway down
      a previous chapter.
    */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    target.scrollTop = 0;

    if (push && history.pushState) {
      history.pushState(
        { screen: id },
        '',
        `#${id}`
      );
    }
  }

  /* =========================================================
     DELEGATED NAVIGATION
     ========================================================= */

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-go]');

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const destination = button.dataset.go;

    if (destination) {
      go(destination, true);
    }
  });

  /* =========================================================
     STORY CONTROLS
     ========================================================= */

  storyBack?.addEventListener('click', () => {
    const index = screens.findIndex(
      screen => screen.id === current
    );

    if (index > 0) {
      go(
        screens[index - 1].id,
        true
      );
    }
  });

  storyNext?.addEventListener('click', () => {
    const next = routes[current];

    if (next) {
      go(next, true);
    }
  });

  /* =========================================================
     KEYBOARD NAVIGATION
     ========================================================= */

  document.addEventListener('keydown', event => {
    const tag = event.target?.tagName?.toLowerCase();

    if (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select'
    ) {
      return;
    }

    if (event.key === 'ArrowRight') {
      const next = routes[current];

      if (next) {
        go(next, true);
      }
    }

    if (event.key === 'ArrowLeft') {
      const index = screens.findIndex(
        screen => screen.id === current
      );

      if (index > 0) {
        go(
          screens[index - 1].id,
          true
        );
      }
    }
  });

  /* =========================================================
     BROWSER BACK / FORWARD
     ========================================================= */

  window.addEventListener('popstate', () => {
    const id = location.hash.replace('#', '');

    go(
      document.getElementById(id)
        ? id
        : 'home',
      false
    );
  });

  /* =========================================================
     WHY US — REASONS CAROUSEL
     ========================================================= */

  const reasons = [
    [
      'I love how',
      'we always find',
      'our way back.',
      'Even after ordinary days, busy weeks, or tiny arguments — somehow it is still you.'
    ],
    [
      'I love how',
      'you make',
      'ordinary days special.',
      'You can turn the smallest moment into something I want to remember forever.'
    ],
    [
      'I love that',
      'we can be',
      'completely ourselves.',
      'No pretending. No performance. Just us, exactly as we are.'
    ],
    [
      'I love our',
      'inside jokes',
      'no one understands.',
      'The kind of laughter that makes absolutely no sense to anyone else.'
    ],
    [
      'I love how',
      'far we have',
      'come together.',
      'Every chapter changed us a little — and I would choose every one again.'
    ],
    [
      'Most of all,',
      'I love that',
      'it is you.',
      'After everything, through everything, I would still choose this story.'
    ]
  ];

  let reasonIndex = 0;

  const reasonNum =
    document.getElementById('reasonNum');

  const reasonTitle =
    document.getElementById('reasonTitle');

  const reasonText =
    document.getElementById('reasonText');

  function renderReason() {
    if (
      !reasonNum ||
      !reasonTitle ||
      !reasonText
    ) {
      return;
    }

    const item = reasons[reasonIndex];

    reasonNum.textContent =
      String(reasonIndex + 1).padStart(2, '0');

    reasonTitle.innerHTML =
      `${item[0]}<br><em>${item[1]}</em><br>${item[2]}`;

    reasonText.textContent = item[3];
  }

  document
    .getElementById('nextReason')
    ?.addEventListener('click', () => {

      reasonIndex =
        (reasonIndex + 1) % reasons.length;

      renderReason();
    });

  document
    .getElementById('prevReason')
    ?.addEventListener('click', () => {

      reasonIndex =
        (reasonIndex - 1 + reasons.length) %
        reasons.length;

      renderReason();
    });

  /* =========================================================
     SONG / VINYL PLAYER
     ========================================================= */

  const playButton =
    document.getElementById('playBtn');

  const audio =
    document.getElementById('audio');

  const vinyl =
    document.getElementById('vinyl');

  const turntable =
    document.querySelector('.turntable');

  const needle =
    document.querySelector('.needle');

  const songTime =
    document.getElementById('songTime');

  let hasAudio = false;

  /*
    Detect whether the customer actually supplied an MP3.
  */
  if (audio) {

    audio.addEventListener(
      'loadedmetadata',
      () => {

        hasAudio =
          Number.isFinite(audio.duration) &&
          audio.duration > 0;

        if (hasAudio) {
          updateSongTime();
        }
      }
    );

    audio.addEventListener(
      'canplay',
      () => {
        hasAudio = true;
      }
    );

    audio.addEventListener(
      'timeupdate',
      updateSongTime
    );

    audio.addEventListener(
      'error',
      () => {
        hasAudio = false;
        stopVisualPlayer();
      }
    );

    audio.addEventListener(
      'ended',
      () => {
        stopVisualPlayer();

        if (playButton) {
          playButton.textContent = '▶';
          playButton.setAttribute(
            'aria-label',
            'Play our song'
          );
        }

        if (songTime) {
          songTime.textContent = '0:00 · 0:00';
        }
      }
    );
  }

  function formatTime(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return '0:00';
    }

    const minutes =
      Math.floor(seconds / 60);

    const secs =
      Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${secs}`;
  }

  function updateSongTime() {
    if (
      !audio ||
      !songTime ||
      !hasAudio
    ) {
      return;
    }

    songTime.textContent =
      `${formatTime(audio.currentTime)} · ${formatTime(audio.duration)}`;
  }

  /*
    PLAYING STATE

    Vinyl:
      .playing → CSS rotates record

    Turntable:
      .playing → CSS moves tonearm

    Needle:
      optional direct class for extra control
  */
  function startVisualPlayer() {

    vinyl?.classList.add('playing');

    turntable?.classList.add('playing');

    needle?.classList.add('playing');
  }

  /*
    STOPPING STATE
  */
  function stopVisualPlayer() {

    vinyl?.classList.remove('playing');

    turntable?.classList.remove('playing');

    needle?.classList.remove('playing');
  }

  /*
    MAIN PLAY BUTTON
  */
  playButton?.addEventListener(
    'click',
    async () => {

      /*
        No MP3 yet:
        Keep the interface alive without throwing errors.
      */
      if (!audio || !hasAudio) {

        playButton.textContent = '♡';

        setTimeout(() => {
          if (playButton) {
            playButton.textContent = '▶';
          }
        }, 850);

        return;
      }

      /*
        PLAY
      */
      if (audio.paused) {

        try {

          await audio.play();

          playButton.textContent = '❚❚';

          playButton.setAttribute(
            'aria-label',
            'Pause our song'
          );

          startVisualPlayer();

        } catch (error) {

          console.warn(
            'Cherivelle: audio could not play.',
            error
          );

          stopVisualPlayer();

        }

        return;
      }

      /*
        PAUSE
      */
      audio.pause();

      playButton.textContent = '▶';

      playButton.setAttribute(
        'aria-label',
        'Play our song'
      );

      stopVisualPlayer();
    }
  );

  /* =========================================================
     FUTURE CHECKLIST
     ========================================================= */

  const checks = [
    ...document.querySelectorAll(
      '.future-paper input'
    )
  ];

  const futureTitle =
    document.getElementById('futureTitle');

  checks.forEach(input => {

    input.addEventListener(
      'change',
      () => {

        if (
          checks.length &&
          checks.every(item => item.checked)
        ) {

          if (futureTitle) {
            futureTitle.textContent =
              'A whole lifetime. ♡';
          }
        } else {

          if (futureTitle) {
            futureTitle.textContent =
              "I can't wait for...";
          }
        }
      }
    );

  });

  /* =========================================================
     REPLAY
     ========================================================= */

  function replay() {

    reasonIndex = 0;
    renderReason();

    checks.forEach(input => {
      input.checked = false;
    });

    if (futureTitle) {
      futureTitle.textContent =
        "I can't wait for...";
    }

    /*
      Stop music completely.
    */
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    stopVisualPlayer();

    if (playButton) {
      playButton.textContent = '▶';

      playButton.setAttribute(
        'aria-label',
        'Play our song'
      );
    }

    go('home', true);
  }

  document
    .getElementById('replay')
    ?.addEventListener(
      'click',
      replay
    );

  document
    .getElementById('replayBottom')
    ?.addEventListener(
      'click',
      replay
    );

  /* =========================================================
     INITIALIZE
     ========================================================= */

  const initial =
    location.hash.replace('#', '');

  go(
    document.getElementById(initial)
      ? initial
      : 'home',
    false
  );

  renderReason();

})();