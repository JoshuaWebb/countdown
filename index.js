let container;
let main;
let targetDate = new Date(2023, 11, 11);
let dayMs = 1000 * 60 * 60 * 24;

function tick() {
  let now = new Date();
  //let now = new Date(2023, 9, 9, 11, 45);

  // TODO: When work days + hours is 0.
  let diffMs = targetDate - now;
  if (diffMs <= 0) {
    main.textContent = "🎉";
    return true;
  }

  let remainingMs = diffMs;
  let wholeDays = ~~(diffMs / dayMs);
  remainingMs -= wholeDays * dayMs;

  if (wholeDays > 7) {
    container.className = "long";
  } else {
    container.className = "short";
  }

  // TODO: Cache days, only recalc hours / rolling window days if it changes ?
  let workDays = 0;
  let workHours = 0;
  if (!(now.getDay() == 0 || now.getDay() == 6)) {
    let h = now.getHours();
    let m = h*60 + now.getMinutes();
    let workMinutes;
    if (m < 12.5*60) {
      workMinutes = Math.max(12*60 - m, 0) + 4.5*60;
    } else {
      workMinutes = 17*60 - m;
    }
    workHours = (workMinutes/60).toFixed(2);
  }
  let d = new Date();
  d.setDate(now.getDate() + 1);
  
  while (d < targetDate) {
    let day = d.getDay();
    if (!(day == 0 || day == 6)) {
      workDays += 1;
    }
    d.setDate(d.getDate() + 1);
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
