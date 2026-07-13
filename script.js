const enterButton = document.getElementById("enterButton");
const rsvpForm = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const shareButton = document.getElementById("shareButton");
const calendarButton = document.getElementById("calendarButton");
const musicButton = document.getElementById("musicButton");
const backgroundMusic = document.getElementById("backgroundMusic");
const guestCountInput = document.getElementById("guestCount");

/* STEP INSIDE */

enterButton.addEventListener("click", function () {
  document.getElementById("welcome").scrollIntoView({
    behavior: "smooth"
  });

  playMusic();
});

/* SCROLL REVEAL */

const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15
  }
);

document.querySelectorAll(".reveal").forEach(function (element) {
  revealObserver.observe(element);
});

/* COUNTDOWN */

/*
  Massachusetts uses Eastern Daylight Time
  on August 30, 2026.
*/

const weddingDate = new Date(
  "2026-08-30T12:20:00-04:00"
).getTime();

function updateCountdown() {
  const currentTime = Date.now();
  const remainingTime = weddingDate - currentTime;

  if (remainingTime <= 0) {
    document.getElementById("countdown").innerHTML = `
      <div
        class="countdown-box"
        style="grid-column: 1 / -1;"
      >
        <strong>Today!</strong>
        <span>Let the celebration begin</span>
      </div>
    `;

    return;
  }

  const days = Math.floor(
    remainingTime / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (remainingTime % (1000 * 60 * 60 * 24)) /
    (1000 * 60 * 60)
  );

  const minutes = Math.floor(
    (remainingTime % (1000 * 60 * 60)) /
    (1000 * 60)
  );

  const seconds = Math.floor(
    (remainingTime % (1000 * 60)) / 1000
  );

  document.getElementById("days").textContent =
    String(days).padStart(2, "0");

  document.getElementById("hours").textContent =
    String(hours).padStart(2, "0");

  document.getElementById("minutes").textContent =
    String(minutes).padStart(2, "0");

  document.getElementById("seconds").textContent =
    String(seconds).padStart(2, "0");
}

updateCountdown();

setInterval(updateCountdown, 1000);

/* RSVP ATTENDANCE CONTROL */

const attendanceInputs = document.querySelectorAll(
  'input[name="attendance"]'
);

attendanceInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    if (this.value === "Not Attending") {
      guestCountInput.value = 0;
      guestCountInput.min = 0;
      guestCountInput.disabled = true;
    } else {
      guestCountInput.disabled = false;
      guestCountInput.min = 1;

      if (Number(guestCountInput.value) < 1) {
        guestCountInput.value = 1;
      }
    }
  });
});

/* FORMSPREE RSVP */

rsvpForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (rsvpForm.action.includes("YOUR_FORM_ID")) {
    formStatus.textContent =
      "Please replace YOUR_FORM_ID with your Formspree form ID.";

    formStatus.style.color = "#9b1c31";

    return;
  }

  const selectedAttendance = document.querySelector(
    'input[name="attendance"]:checked'
  );

  if (!selectedAttendance) {
    formStatus.textContent =
      "Please select whether you will attend.";

    formStatus.style.color = "#9b1c31";

    return;
  }

  if (selectedAttendance.value === "Not Attending") {
    guestCountInput.disabled = false;
    guestCountInput.value = 0;
  }

  const submitButton = rsvpForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    const response = await fetch(rsvpForm.action, {
      method: "POST",
      body: new FormData(rsvpForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    formStatus.textContent =
      "Thank you! Your RSVP has been received.";

    formStatus.style.color = "#345f3b";

    rsvpForm.reset();

    guestCountInput.disabled = false;
    guestCountInput.min = 1;
    guestCountInput.value = 1;

    createCelebrationFlowers();

  } catch (error) {
    formStatus.textContent =
      "Sorry, something went wrong. Please try again.";

    formStatus.style.color = "#9b1c31";

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send RSVP";
  }
});

/* SHARE INVITATION */

shareButton.addEventListener("click", async function () {
  const shareInformation = {
    title: "Navya & Srinivas Wedding Invitation",
    text:
      "You are invited to celebrate the wedding of " +
      "Navya Jyothi Nalla and Srinivas Reddy Aleti " +
      "on August 30, 2026.",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareInformation);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Invitation link copied!");
    } else {
      alert(window.location.href);
    }
  } catch (error) {
    console.log("Sharing was cancelled.");
  }
});

/* ADD TO CALENDAR */

calendarButton.addEventListener("click", function () {
  const calendarContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Navya and Srinivas Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:navya-srinivas-wedding-20260830@example.com",
    "DTSTAMP:20260713T000000Z",
    "DTSTART:20260830T162000Z",
    "DTEND:20260830T190000Z",
    "SUMMARY:Navya and Srinivas Wedding",
    "DESCRIPTION:Marriage ceremony of Navya Jyothi Nalla and Srinivas Reddy Aleti.",
    "LOCATION:99 Shirdi Way\\, Groton\\, MA 01450",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const calendarBlob = new Blob(
    [calendarContent],
    {
      type: "text/calendar;charset=utf-8"
    }
  );

  const calendarUrl =
    URL.createObjectURL(calendarBlob);

  const downloadLink =
    document.createElement("a");

  downloadLink.href = calendarUrl;

  downloadLink.download =
    "Navya-Srinivas-Wedding.ics";

  document.body.appendChild(downloadLink);

  downloadLink.click();

  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(calendarUrl);
});

/* MUSIC */

let musicPlaying = true;

async function playMusic() {
  try {
    await backgroundMusic.play();

    musicPlaying = true;

    musicButton.textContent = "❚❚";

    musicButton.classList.add("playing");
  } catch (error) {
    console.log(
      "Music will start after the user presses the music button."
    );
  }
}

function pauseMusic() {
  backgroundMusic.pause();

  musicPlaying = false;

  musicButton.textContent = "♫";

  musicButton.classList.remove("playing");
}

musicButton.addEventListener("click", function () {
  if (musicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
});

/* FALLING FLOWERS */

const petalsContainer =
  document.querySelector(".petals");

const petalSymbols = [
  "🌸",
  "🌺",
  "❀",
  "🌼"
];

function createPetal() {
  const petal =
    document.createElement("span");

  petal.textContent =
    petalSymbols[
      Math.floor(
        Math.random() * petalSymbols.length
      )
    ];

  petal.style.left =
    `${Math.random() * 100}vw`;

  petal.style.fontSize =
    `${10 + Math.random() * 13}px`;

  petal.style.opacity =
    `${0.25 + Math.random() * 0.5}`;

  petal.style.setProperty(
    "--drift",
    `${-100 + Math.random() * 200}px`
  );

  petal.style.animationDuration =
    `${7 + Math.random() * 7}s`;

  petalsContainer.appendChild(petal);

  setTimeout(function () {
    petal.remove();
  }, 15000);
}

setInterval(createPetal, 1000);

/* EXTRA FLOWERS AFTER RSVP */

function createCelebrationFlowers() {
  for (let index = 0; index < 35; index++) {
    setTimeout(function () {
      createPetal();
    }, index * 80);
  }
}