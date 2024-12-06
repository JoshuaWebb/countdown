let container;
let counts;
let main;
let sub;
let celebration;
let targetDate = new Date(2024, 11, 6, 17, 0);
//targetDate = new Date(2023, 9, 13, 17, 0);
let dayMs = 1000 * 60 * 60 * 24;
let lunchStartMinutes = 12*60;
let lunchDurationMinutes = 30;
let lunchEndMinutes = lunchStartMinutes + lunchDurationMinutes;
let clockOnMinutes = 9*60;
let clockOnDurationMinutes = 7.5*60;
let clockOffMinutes = clockOnMinutes + clockOnDurationMinutes + lunchDurationMinutes;

function tick() {
  let now = new Date();
  //now = new Date(2023, 11, 8, 16, 58);
  //now = new Date(Date.now() + 5007200000);
  now = new Date(Date.now() - 17200000);

  // Strip off seconds and millis as they are below the resolution we care about
  now.setMilliseconds(0);
  now.setSeconds(0);

  let diffMs = targetDate - now;
  if (diffMs <= 0) {
    counts.className = "hidden";
    celebration.className = "shown";
    return true;
  } else {
    counts.className = "shown";
    celebration.className = "hidden";
  }

  // TODO: Cache days, only recalc hours / rolling window days if it changes ?
  let workDays = 0;
  let workHours = 0;
  let workMinutesTotal = 0;
  if (!(now.getDay() == 0 || now.getDay() == 6)) {
    let h = now.getHours();
    let m = h*60 + now.getMinutes();
    if (m < lunchEndMinutes) {
      workMinutesTotal = Math.max(lunchStartMinutes - m, 0) + clockOffMinutes - lunchEndMinutes;
    } else {
      workMinutesTotal = clockOffMinutes - m;
    }
    workHours = (workMinutesTotal/60).toFixed(2);
  }
  if (workMinutesTotal >= clockOnDurationMinutes) {
    workHours = 0;
    workDays = 1;
  }

  let d = new Date(now);
  d.setDate(now.getDate() + 1);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  while (d <= targetDate) {
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

  // TODO: rounding... 9:01 should still show ~8 hours on realtime
  let wholeHours = ~~(remainingMs / (1000*60*60));
  let wholeMinutesTotal = remainingMs / (1000*60);
  remainingMs -= wholeHours * 1000*60*60;
  let wholeMinutes = ~~(remainingMs / (1000*60))
  if (wholeDays < 1) {
    if (wholeHours <= 0) {
      main.innerHTML = `<span class="major">${plu(wholeMinutes, "minute")}</span>`;
    } else {
      if (wholeMinutesTotal == workMinutesTotal) {
        main.innerHTML = `<span class="major">${plu(wholeHours, "hour")}</span>`;
        if (wholeMinutes > 0) {
          let minor = document.createElement("span")
          minor.class = "minor";
          minor.textContent = plu(wholeMinutes, "minute");
          main.appendChild(minor);
        }
      } else {
        main.innerHTML = `<span class="major">${plu(wholeHours, "hour")}</span>`;
        if (wholeMinutes > 0) {
          let minor = document.createElement("span")
          minor.class = "minor";
          minor.textContent = plu(wholeMinutes, "minute");
          main.appendChild(minor);
        }

        workHours = ~~(workMinutesTotal/60);
        let workMinutes = workMinutesTotal - workHours*60;

        sub.innerHTML = `<span class="major">${plu(workHours, "hour")}</span>`;
        let minor = document.createElement("span")
        minor.class = "minor";
        minor.textContent = plu(workMinutes, "minute");
        sub.appendChild(minor);
      }
    }
  } else {
    main.innerHTML = `<span class="major">${plu(wholeDays, "day")}</span>`;
    let displayHours = ~~Math.round(wholeHours + wholeMinutes/60);
    if (displayHours > 0) {
      let minor = document.createElement("span")
      minor.class = "minor";
      minor.textContent = plu(displayHours, "hour");
      main.appendChild(minor);
    }

    sub.innerHTML = `<span class="major">${plu(workDays, "day")}</span>`;
    if (workHours > 0) {
      let minor = document.createElement("span")
      minor.class = "minor";
      minor.textContent = plu(workHours, "hour");
      sub.appendChild(minor);
    }
  }

  return false;
}

function plu(value, unit) {
  if (value == 1) {
    switch(unit) {
    case "hour": return `${value} Hour`;
    case "minute": return `${value} Minute`;
    case "day": return `${value} Day`;
    }
  } else {
    switch(unit) {
    case "hour": return `${value} Hours`;
    case "minute": return `${value} Minutes`;
    case "day": return `${value} Days`;
    }
  }
  return "unhandled";
}

function init() {
  container = document.getElementById("container");
  counts = document.getElementById("counts");
  main = document.getElementById("main");
  sub = document.getElementById("sub");
  celebration = document.getElementById("celebration");
  if (!tick()) {
    let tickInterval = setInterval(() => {
      if (tick()) {
        cancelInterval(tickInterval);
      }
    }, 1000);
  }
}
