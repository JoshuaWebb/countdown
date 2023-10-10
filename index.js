let container;
let main;
let targetDate = new Date(2023, 11, 8, 17, 0);
let dayMs = 1000 * 60 * 60 * 24;
let lunchStartMinutes = 12*60;
let lunchDurationMinutes = 30;
let lunchEndMinutes = lunchStartMinutes + lunchDurationMinutes;
let clockOffMinutes = 17*60;

function tick() {
  let now = new Date();
  //now = new Date(2023, 11, 8, 16, 45);

  let diffMs = targetDate - now;
  if (diffMs <= 0) {
    main.textContent = "🎉";
    return true;
  }

  // TODO: Cache days, only recalc hours / rolling window days if it changes ?
  let workDays = 0;
  let workHours = 0;
  if (!(now.getDay() == 0 || now.getDay() == 6)) {
    let h = now.getHours();
    let m = h*60 + now.getMinutes();
    let workMinutes;
    if (m < lunchEndMinutes) {
      // TODO: calc/derive 4.5
      workMinutes = Math.max(lunchStartMinutes - m, 0) + 4.5*60;
    } else {
      workMinutes = clockOffMinutes - m;
    }
    workHours = (workMinutes/60).toFixed(2);
  }

  let d = new Date(now);
  d.setDate(now.getDate() + 1);
  
  while (d < targetDate) {
    let day = d.getDay();
    if (!(day == 0 || day == 6)) {
      workDays += 1;
    }
    d.setDate(d.getDate() + 1);
  }

  let remainingMs = diffMs;
  let wholeDays = ~~(diffMs / dayMs);
  remainingMs -= wholeDays * dayMs;

  if (wholeDays > 7) {
    container.className = "long";
  } else {
    container.className = "short";
  }

  if (wholeDays < 1) {
    // TODO: Hours as major
  }

  let wholeHours = ~~(remainingMs / (1000*60*60));
  main.innerHTML = `<span class="major">${wholeDays} Days</span>`;
  if (wholeHours > 0) {
    let minor = document.createElement("span")
    minor.class = "minor";
    minor.textContent =  `${wholeHours} Hours`;
    main.appendChild(minor);
  }

  sub.innerHTML = `<span class="major">${workDays} Days</span>`;
  if (workHours > 0) {
    let minor = document.createElement("span")
    minor.class = "minor";
    minor.textContent =  `${workHours} Hours`;
    sub.appendChild(minor);
  }

  return false;
}

function init() {
  container = document.getElementById("container");
  main = document.getElementById("main");
  if (!tick()) {
    let tickInterval = setInterval(() => {
      if (tick()) {
        cancelInterval(tickInterval);
      }
    }, 1000);
  }
}
