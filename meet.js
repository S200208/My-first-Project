document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu-btn');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');
  const sidebar = document.querySelector('.sidebar');
  const mic = document.getElementById('mic-btn');
  const cam = document.getElementById('cam-btn');
  const hang = document.getElementById('hangup-btn');
  const present = document.getElementById('present-btn');
  const newMeeting = document.getElementById('new-meeting') || document.querySelector('.new-meet');
  const joinBtn = document.getElementById('join-btn') || document.querySelector('.join-btn');
  const joinInput = document.getElementById('join-input') || document.getElementById('meet-code');
  const raise = document.getElementById('raise-btn');

  function toggle(button) {
    if (!button) return;
    button.classList.toggle('off');
    const isOff = button.classList.contains('off');
    button.setAttribute('aria-pressed', (!isOff).toString());
  }

  if (mic) mic.addEventListener('click', () => toggle(mic));
  if (cam) cam.addEventListener('click', () => toggle(cam));

  if (hang) hang.addEventListener('click', () => {
    hang.disabled = true;
    hang.style.transform = 'scale(0.98)';
    setTimeout(() => {
      // If we're on meeting page, go back to landing; otherwise just mock
      if (location.pathname.endsWith('meeting.html')) {
        location.href = 'index.html';
      } else {
        alert('You left the call (mock)');
        hang.disabled = false;
        hang.style.transform = '';
      }
    }, 200);
  });

  if (present) present.addEventListener('click', () => {
    present.classList.add('off');
    setTimeout(() => present.classList.remove('off'), 800);
    const previous = document.title;
    document.title = 'Presenting — Project Sync';
    setTimeout(() => (document.title = previous), 1400);
  });

  // Start a new meeting (navigate to meeting page)
  if (newMeeting) {
    newMeeting.addEventListener('click', () => {
      // In a full app you would create a meeting code; here we go directly
      location.href = 'meeting.html';
    });
  }

  // Join via code/link (simple navigation)
  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      const code = joinInput ? joinInput.value.trim() : '';
      // optionally validate code - here we just navigate
      location.href = 'meeting.html';
    });
  }

  // Raise hand behaviour (toggles a visual state on the "You" tile)
  if (raise) {
    raise.addEventListener('click', () => {
      const you = document.querySelector('.tile[data-name="You"]');
      if (!you) return;
      you.classList.toggle('raised');
      // add a small indicator element if not present
      let ind = you.querySelector('.hand-indicator');
      if (you.classList.contains('raised')) {
        if (!ind) {
          ind = document.createElement('div');
          ind.className = 'hand-indicator';
          ind.textContent = '✋ Raised';
          you.appendChild(ind);
        }
      } else {
        if (ind) ind.remove();
      }
    });
  }

  function openSidebar() {
    document.body.classList.add('sidebar-open');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
    if (hamburger) hamburger.classList.add('open');
    if (menu) menu.classList.add('open');
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    if (hamburger) hamburger.classList.remove('open');
    if (menu) menu.classList.remove('open');
  }

  if (menu) menu.addEventListener('click', () => { if (document.body.classList.contains('sidebar-open')) closeSidebar(); else openSidebar(); });
  if (hamburger) hamburger.addEventListener('click', () => {
    // toggle overlay-mode side panel
    if (document.body.classList.contains('sidebar-open')) closeSidebar(); else openSidebar();
  });

  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keyup', (e) => { if (e.key === 'Escape') closeSidebar(); });

  // Navigation buttons in the left sliding sidebar
  const navMeet = document.getElementById('nav-meetings');
  const navCalls = document.getElementById('nav-calls');
  if (navMeet) navMeet.addEventListener('click', () => {
    // close the sidebar with the overlay then navigate
    closeSidebar();
    setTimeout(() => { location.href = 'meeting.html'; }, 200);
  });
  if (navCalls) navCalls.addEventListener('click', () => {
    closeSidebar();
    setTimeout(() => { location.href = 'meeting.html'; }, 200);
  });

  // Slide-to-Join behaviour (draggable round knob)
  const joinSlider = document.getElementById('join-slider');
  const joinKnob = document.getElementById('join-knob');
  if (joinSlider && joinKnob) {
    const track = joinSlider.querySelector('.join-track');
    let dragging = false;
    let startX = 0;
    let knobLeft = 6; // initial left in px (matches CSS)

    function setKnobLeft(px) {
      const max = track.clientWidth - joinKnob.clientWidth - 6;
      const value = Math.max(6, Math.min(px, max));
      joinKnob.style.left = value + 'px';
      // mark joined visual when near the end
      if (value >= max * 0.72) track.classList.add('joined'); else track.classList.remove('joined');
    }

    joinKnob.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      joinKnob.setPointerCapture(e.pointerId);
      joinKnob.style.transition = 'none';
    });

    document.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      setKnobLeft(knobLeft + dx);
    });

    document.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      // release pointer capture safely
      try { joinKnob.releasePointerCapture(e.pointerId); } catch (err) {}
      // determine final position
      const max = track.clientWidth - joinKnob.clientWidth - 6;
      const curLeft = parseFloat(joinKnob.style.left || knobLeft);
      joinKnob.style.transition = '';
      if (curLeft >= max * 0.72) {
        // slide to the end and navigate
        setKnobLeft(max);
        setTimeout(() => { location.href = 'meeting.html'; }, 180);
      } else {
        // snap back
        setKnobLeft(6);
      }
      // reset knobLeft reference
      knobLeft = parseFloat(joinKnob.style.left || 6);
    });

    // keyboard support: allow Enter / ArrowRight to trigger
    joinKnob.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        // animate to end and navigate
        const max = track.clientWidth - joinKnob.clientWidth - 6;
        setKnobLeft(max);
        setTimeout(() => { location.href = 'meeting.html'; }, 160);
      }
    });
  }
});
    let index = 0; 
    const slides = document.querySelector(".slides");
    const totalSlides = document.querySelectorAll(".slides img").length;

    document.querySelector(".next").addEventListener("click", function () {
        index++;
        if (index >= totalSlides) index = 0;
        slides.style.transform = `translateX(-${index * 100}%)`;
    });

    document.querySelector(".prev").addEventListener("click", function () {
        index--;
        if (index < 0) index = totalSlides - 1;
        slides.style.transform = `translateX(-${index * 100}%)`;
    });



