/* ==========================================================================
   Für Mathe-Arbeit üben — Adaptiver Mehr-Tages-Trainingsplan (ohne Login)
   ========================================================================== */
(function () {
  const EXAM_PLAN_STORAGE_KEY = "mathe-exam-plan-v1";
  const CHART_COLORS = [
    "#2f5d50", // Salbeigrün
    "#c45c26", // Terrakotta
    "#3b6ea5", // Ozeanblau
    "#8e5572", // Beere
    "#b07d2b", // Ocker
    "#4a7c59", // Waldgrün
    "#6b5b95", // Violett
    "#c0392b", // Koralle
  ];

  const entrySection = document.getElementById("exam-plan-entry");
  const entryTitle = document.getElementById("exam-plan-entry-title");
  const entryDesc = document.getElementById("exam-plan-entry-desc");
  const entryActions = document.getElementById("exam-plan-entry-actions");
  const openBtn = document.getElementById("exam-plan-open-btn");
  const activeBar = document.getElementById("exam-plan-active-bar");

  const dialog = document.getElementById("exam-plan-dialog");
  const closeXBtn = document.getElementById("exam-plan-close-x");
  const cancelBtn = document.getElementById("exam-plan-cancel");
  const submitBtn = document.getElementById("exam-plan-submit");
  const gradeSelect = document.getElementById("exam-plan-grade");
  const termSelect = document.getElementById("exam-plan-term");
  const daysSelect = document.getElementById("exam-plan-days");
  const dateInput = document.getElementById("exam-plan-date");
  const dailyCountSelect = document.getElementById("exam-plan-daily-count");
  const dailyRecHint = document.getElementById("exam-plan-daily-rec-hint");
  const topicsListEl = document.getElementById("exam-plan-topics-list");
  const selectAllBtn = document.getElementById("exam-plan-select-all");
  const selectNoneBtn = document.getElementById("exam-plan-select-none");
  const errorEl = document.getElementById("exam-plan-error");

  const briefingEl = document.getElementById("exam-day-briefing");
  const summaryEl = document.getElementById("exam-day-summary");

  if (!entrySection || !dialog) {
    return;
  }

  let activeExamSession = null; // { dayIndex, firstCheckDone, checkAttempts, firstTryByTopic, firstTryCorrect, firstTryWrongTasks }
  let userOverrodeDailyCount = false;

  function getCheckedDialogTopics() {
    if (!topicsListEl) return [];
    return [...topicsListEl.querySelectorAll("input[data-exam-topic]:checked")].map(
      (el) => el.dataset.examTopic
    );
  }

  function estimateMinutesForDailyCount(topicIds, dailyCount, grade, term) {
    if (!topicIds.length) {
      return Math.round(dailyCount * 0.75);
    }
    const avgSec =
      topicIds.reduce((sum, id) => {
        const sec =
          typeof secondsForTopic === "function" ? secondsForTopic(id, grade, term) : 30;
        return sum + sec;
      }, 0) / topicIds.length;
    // Faktor 1.3 berücksichtigt Nachdenken + anschließende Korrekturrunde der 2-Stufen-Prüfung
    const totalSec = avgSec * dailyCount * 1.3;
    return Math.max(5, Math.round(totalSec / 60));
  }

  function computeRecommendedDailyCount(topicIds, grade, term) {
    const count = topicIds.length;
    if (count === 0) {
      return {
        recommended: 30,
        reason: "Bitte wähle oben mindestens ein Prüfungsthema aus.",
      };
    }

    const min20 = estimateMinutesForDailyCount(topicIds, 20, grade, term);
    const min30 = estimateMinutesForDailyCount(topicIds, 30, grade, term);
    const min40 = estimateMinutesForDailyCount(topicIds, 40, grade, term);

    // 1. Wunsch-Umfang anhand der Themen-Anzahl (damit jedes Thema genug Aufgaben für die Statistik hat):
    //    1–2 Themen -> 20 Aufgaben | 3–4 Themen -> 30 Aufgaben | ab 5 Themen -> 40 Aufgaben
    let idealByTopicCount = 30;
    if (count <= 2) {
      idealByTopicCount = 20;
    } else if (count <= 4) {
      idealByTopicCount = 30;
    } else {
      idealByTopicCount = 40;
    }

    // 2. Zeit-Bremse (Deckelung bei zeitintensiven Themen, egal ob 3, 4 oder 5+ Themen):
    //    Eine tägliche Sitzung sollte im Idealfall ~25 Minuten nicht überschreiten.
    if (idealByTopicCount === 40 && min40 > 26) {
      // Wenn 40 Aufgaben länger als ~26 Min. dauern würden, gehe runter auf 30 (oder bei extrem langen Themen sogar auf 20)
      if (min30 > 27) {
        return {
          recommended: 20,
          reason: `Empfehlung bei ${count} sehr zeitintensiven Themen: 20 Aufgaben pro Tag (ca. ${min20} Min.), damit das Training nicht zu lang wird.`,
        };
      }
      return {
        recommended: 30,
        reason: `Empfehlung bei ${count} Themen (inkl. aufwendiger Aufgaben): 30 Aufgaben pro Tag (ca. ${min30} Min.) statt 40, damit die Übungszeit im Rahmen bleibt.`,
      };
    }

    if (idealByTopicCount === 30 && min30 > 26) {
      // Genau der Fall bei 3 oder 4 Themen mit hohem Zeitbedarf (z. B. Sachaufgaben, Gleichungen, Dreisatz, Schriftlich):
      return {
        recommended: 20,
        reason: `Empfehlung bei ${count} rechen-/textintensiven Themen: 20 Aufgaben pro Tag (ca. ${min20} Min.), da 30 Aufgaben hier schon rund ${min30} Min. dauern würden.`,
      };
    }

    // 3. Umgekehrt: Wenn jemand 3–4 sehr schnelle Kopfrechen-/Erkennungsthemen wählt und 30 Aufgaben unter 14 Min. liegen,
    //    kann bei 4 Themen auch 40 empfohlen werden.
    if (idealByTopicCount === 30 && count === 4 && min40 <= 20) {
      return {
        recommended: 40,
        reason: `Empfehlung bei 4 schnellen Themen: 40 Aufgaben pro Tag (ca. ${min40} Min. · 10 pro Thema).`,
      };
    }

    const estMin =
      idealByTopicCount === 20 ? min20 : idealByTopicCount === 30 ? min30 : min40;
    const perTopic = Math.round(idealByTopicCount / count);
    return {
      recommended: idealByTopicCount,
      reason: `Empfehlung bei ${count === 1 ? "1 Thema" : `${count} Themen`}: ${idealByTopicCount} Aufgaben pro Tag (ca. ${estMin} Min. · Ø ${perTopic} Aufgaben pro Thema).`,
    };
  }

  function syncDailyCountRecommendation() {
    if (!dailyCountSelect) return;
    const grade = Number(gradeSelect?.value) || selectedGrade || 3;
    const term = Number(termSelect?.value) === 1 ? 1 : 2;
    const chosen = getCheckedDialogTopics();
    const { recommended, reason } = computeRecommendedDailyCount(chosen, grade, term);

    [...dailyCountSelect.options].forEach((opt) => {
      const val = Number(opt.value);
      const estMin = estimateMinutesForDailyCount(chosen, val, grade, term);
      const base = `${val} Aufgaben pro Tag (ca. ${estMin} Min.)`;
      opt.textContent = val === recommended ? `${base} – Empfohlen` : base;
    });

    if (!userOverrodeDailyCount) {
      dailyCountSelect.value = String(recommended);
    }

    if (dailyRecHint) {
      dailyRecHint.textContent = reason;
    }
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function topicDisplayName(topicId, grade) {
    if (topicId === "decompose") {
      return grade <= 1
        ? "Zerlegen und Zehnerfreunde"
        : "Zerlegen, Zehner- und Hunderterfreunde";
    }
    const topic = getTopic(topicId);
    return topic ? topic.label : topicId;
  }

  function loadExamPlan() {
    try {
      const raw = localStorage.getItem(EXAM_PLAN_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.topicIds) ||
        !parsed.topicIds.length ||
        !(parsed.grade >= 1 && parsed.grade <= 6)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function saveExamPlan(plan) {
    try {
      localStorage.setItem(EXAM_PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch {
      /* Speicher voll oder blockiert */
    }
  }

  function clearSavedExamPlan() {
    try {
      localStorage.removeItem(EXAM_PLAN_STORAGE_KEY);
    } catch {
      /* ignorieren */
    }
  }

  function encodePlanToUrlParam(plan) {
    try {
      const compact = {
        v: 1,
        id: plan.id,
        g: plan.grade,
        t: plan.term,
        d: plan.totalDays,
        c: plan.dailyCount,
        dt: plan.examDate || "",
        tp: plan.topicIds,
        cd: plan.currentDay,
        h: (plan.daysHistory || []).map((day) => ({
          d: day.day,
          fc: day.firstTryCorrect,
          tot: day.total,
          ts: day.topicStats,
        })),
        ep: (plan.errorPool || []).slice(0, 12),
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(compact))));
    } catch {
      return "";
    }
  }

  function decodePlanFromUrlParam(encoded) {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const data = JSON.parse(json);
      if (!data || !(data.g >= 1 && data.g <= 6) || !Array.isArray(data.tp) || !data.tp.length) {
        return null;
      }
      return {
        id: data.id || `plan-${Date.now()}`,
        grade: Number(data.g),
        term: Number(data.t) === 1 ? 1 : 2,
        totalDays: Math.min(14, Math.max(2, Number(data.d) || 5)),
        dailyCount: [20, 30, 40].includes(Number(data.c)) ? Number(data.c) : 30,
        examDate: data.dt || "",
        topicIds: data.tp.filter((id) => Boolean(getTopic(id))),
        currentDay: Math.max(1, Number(data.cd) || 1),
        daysHistory: Array.isArray(data.h)
          ? data.h.map((item) => ({
              day: item.d,
              firstTryCorrect: item.fc,
              total: item.tot,
              topicStats: item.ts || {},
            }))
          : [],
        errorPool: Array.isArray(data.ep) ? data.ep : [],
      };
    } catch {
      return null;
    }
  }

  function buildBackupLink(plan) {
    const token = encodePlanToUrlParam(plan);
    const url = new URL(`${window.location.origin}/klasse-${plan.grade}/uebungen`);
    if (token) {
      url.searchParams.set("lernplan", token);
    }
    return url.toString();
  }

  function clearExamDayCards() {
    activeExamSession = null;
    if (briefingEl) {
      briefingEl.classList.add("is-hidden");
      briefingEl.innerHTML = "";
    }
    if (summaryEl) {
      summaryEl.classList.add("is-hidden");
      summaryEl.innerHTML = "";
    }
    if (checkBtn) {
      checkBtn.textContent = "Prüfen";
    }
  }

  window.clearExamDayCards = clearExamDayCards;

  function formatExamCountdownText(plan) {
    const remainingDays = Math.max(0, plan.totalDays - plan.currentDay + 1);
    if (plan.currentDay > plan.totalDays) {
      return "Alle Trainingstage abgeschlossen — bereit für die Mathe-Arbeit!";
    }
    if (remainingDays === 1) {
      return `Tag ${plan.currentDay} von ${plan.totalDays} · Generalprobe vor der Arbeit!`;
    }
    return `Tag ${plan.currentDay} von ${plan.totalDays} · Noch ${remainingDays} Trainingstage bis zur Arbeit`;
  }

  function renderDialogTopics(grade, term, preselectedIds = null) {
    if (!topicsListEl) {
      return;
    }
    const allowed = topics.filter((topic) => isTopicAllowed(topic, grade, term));
    const currentChecked =
      preselectedIds ||
      new Set(
        [...topicsListEl.querySelectorAll("input[data-exam-topic]:checked")].map(
          (el) => el.dataset.examTopic
        )
      );

    // Falls noch nichts ausgewählt ist, sinnvolle Standardauswahl (erste 3–4 Kernthemen)
    const useDefault = currentChecked.size === 0 && !preselectedIds;
    const defaultIds = new Set(allowed.slice(0, Math.min(4, allowed.length)).map((t) => t.id));

    topicsListEl.innerHTML = allowed
      .map((topic) => {
        const checked = useDefault ? defaultIds.has(topic.id) : currentChecked.has(topic.id);
        const label = topicDisplayName(topic.id, grade);
        return `
          <label class="exam-plan-topic-item">
            <input type="checkbox" data-exam-topic="${escapeHtml(topic.id)}" ${checked ? "checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      })
      .join("");
    syncDailyCountRecommendation();
  }

  function updateSubmitButtonLabel() {
    const days = Number(daysSelect?.value) || 5;
    if (submitBtn) {
      submitBtn.textContent = `${days}-Tage-Lernplan starten (Tag 1)`;
    }
  }

  function openExamPlanDialog() {
    const existing = loadExamPlan();
    const currentGrade =
      selectedGrade || getLockedGrade() || (existing ? existing.grade : 3);
    const currentTerm =
      selectedTerm || (existing ? existing.term : 2);

    if (gradeSelect) {
      gradeSelect.value = String(currentGrade);
    }
    if (termSelect) {
      termSelect.value = String(currentTerm);
    }
    if (daysSelect) {
      daysSelect.value = existing ? String(existing.totalDays) : "5";
    }
    userOverrodeDailyCount = Boolean(
      existing && [20, 30, 40].includes(Number(existing.dailyCount))
    );
    if (dailyCountSelect && userOverrodeDailyCount) {
      dailyCountSelect.value = String(existing.dailyCount);
    }
    if (dateInput) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);
      dateInput.min = minDate.toISOString().slice(0, 10);
      dateInput.value = existing?.examDate || "";
    }

    const pageSelected = selectedTopics();
    const preselected = pageSelected.length
      ? new Set(pageSelected)
      : existing && existing.grade === currentGrade && existing.term === currentTerm
        ? new Set(existing.topicIds)
        : null;

    renderDialogTopics(currentGrade, currentTerm, preselected);
    if (errorEl) {
      errorEl.classList.add("is-hidden");
      errorEl.textContent = "";
    }
    updateSubmitButtonLabel();
    dialog.showModal();
  }

  function countConsecutive100PctDays(history, topicId) {
    if (!Array.isArray(history) || !history.length) {
      return 0;
    }
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const st = history[i]?.topicStats?.[topicId];
      if (!st || !(st.total > 0)) {
        break;
      }
      if (st.firstTryCorrect === st.total) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  function isEveryTopicAllDays100Pct(history, topicIds) {
    if (!Array.isArray(history) || !history.length) {
      return false;
    }
    return history.every((dayEntry) =>
      topicIds.every((id) => {
        const st = dayEntry?.topicStats?.[id];
        return st && st.total > 0 && st.firstTryCorrect === st.total;
      })
    );
  }

  function computeAdaptiveTopicQuotas(plan, dayNumber) {
    const topicIds = plan.topicIds.filter((id) => {
      const topic = getTopic(id);
      return topic && isTopicAllowed(topic, plan.grade, plan.term);
    });
    const totalCount = plan.dailyCount || 20;
    if (!topicIds.length) {
      return [];
    }

    const history = Array.isArray(plan.daysHistory) ? plan.daysHistory : [];
    const prevDay = history.length ? history[history.length - 1] : null;

    // Tag 1: Gleichmäßige Verteilung (Diagnose-Check)
    if (dayNumber <= 1 || !prevDay || !prevDay.topicStats) {
      const list = [];
      for (let i = 0; i < totalCount; i += 1) {
        list.push(topicIds[i % topicIds.length]);
      }
      return list;
    }

    // Normal-Anteil pro Thema (z. B. 30 / 4 = 7.5 -> 8 Aufgaben)
    const baseShare = totalCount / topicIds.length;
    const minRetention = Math.max(2, Math.round(baseShare * 0.35)); // z. B. bei 8 -> 3, bei 10 -> 4, bei 6 -> 2
    const oneTime100Cap = Math.max(minRetention + 1, Math.round(baseShare * 0.62)); // z. B. bei 8 -> 5, bei 10 -> 6, bei 6 -> 4

    // Kumulierte Statistik + Streak für jedes Thema ermitteln
    const topicMeta = topicIds.map((id) => {
      let cumCorrect = 0;
      let cumTotal = 0;
      history.forEach((dayEntry) => {
        const st = dayEntry?.topicStats?.[id];
        if (st && st.total > 0) {
          cumCorrect += Number(st.firstTryCorrect) || 0;
          cumTotal += Number(st.total) || 0;
        }
      });
      const prevSt = prevDay.topicStats?.[id];
      const overallAcc = cumTotal > 0 ? cumCorrect / cumTotal : 0.7;
      const prevAcc =
        prevSt && prevSt.total > 0 ? prevSt.firstTryCorrect / prevSt.total : overallAcc;
      const streak100 = countConsecutive100PctDays(history, id);
      const blendedErrorRate = Math.max(0, 1 - (prevAcc * 0.7 + overallAcc * 0.3));

      return {
        id,
        prevAcc,
        overallAcc,
        streak100,
        blendedErrorRate,
      };
    });

    // Sonderfall "Meister-Bonus": JEDES Thema war an ALLEN bisherigen Tagen bei exakt 100 %!
    // Nur in diesem Fall wird die Gesamt-Aufgabenanzahl des Tages als Belohnung reduziert.
    if (isEveryTopicAllDays100Pct(history, topicIds)) {
      const counts = {};
      topicMeta.forEach((m) => {
        counts[m.id] = m.streak100 >= 2 ? minRetention : oneTime100Cap;
      });
      const planArray = [];
      topicIds.forEach((id) => {
        for (let i = 0; i < counts[id]; i += 1) {
          planArray.push(id);
        }
      });
      return planArray;
    }

    // Regulärer Fall: Mindestens ein Thema war nicht durchgehend bei 100 %.
    // Die Gesamtzahl bleibt strikt bei totalCount (20, 30 oder 40).
    // 1. Themen mit 100 %-Streak bekommen ihren reduzierten Fest-Anteil (z. B. 8 -> 5 -> 3),
    //    solange mindestens ein anderes Thema noch < 100 % am Vortag hatte.
    const nonPerfectTopics = topicMeta.filter((m) => m.streak100 === 0);
    const counts = {};
    let assigned = 0;

    if (nonPerfectTopics.length > 0) {
      // Alle Themen mit 100 % am Vortag werden gedeckelt (1x 100% -> ~62%, >=2x 100% -> ~35%)
      topicMeta.forEach((m) => {
        if (m.streak100 >= 2) {
          counts[m.id] = minRetention;
          assigned += minRetention;
        } else if (m.streak100 === 1) {
          counts[m.id] = oneTime100Cap;
          assigned += oneTime100Cap;
        }
      });

      // Die übrigen Aufgaben (inkl. der eingesparten aus den 100%-Themen!) werden auf die Themen < 100 % verteilt
      const remaining = Math.max(0, totalCount - assigned);
      const minForNonPerfect = Math.min(
        Math.max(3, Math.floor(baseShare * 0.7)),
        Math.floor(remaining / nonPerfectTopics.length)
      );

      nonPerfectTopics.forEach((m) => {
        counts[m.id] = minForNonPerfect;
        assigned += minForNonPerfect;
      });

      const poolToDistribute = Math.max(0, totalCount - assigned);
      // Gewichtung unter den Nicht-100%-Themen stark nach Fehlerquote
      const weights = nonPerfectTopics.map((m) => ({
        id: m.id,
        weight: 0.4 + 3.6 * m.blendedErrorRate,
      }));
      const sumWeights = weights.reduce((acc, item) => acc + item.weight, 0) || 1;

      const fractional = weights.map((item) => {
        const exact = (item.weight / sumWeights) * poolToDistribute;
        const floor = Math.floor(exact);
        counts[item.id] += floor;
        assigned += floor;
        return { id: item.id, rem: exact - floor };
      });

      fractional.sort((a, b) => b.rem - a.rem);
      let idx = 0;
      while (assigned < totalCount && fractional.length > 0) {
        counts[fractional[idx % fractional.length].id] += 1;
        assigned += 1;
        idx += 1;
      }
    } else {
      // Alle Themen hatten gestern 100 %, aber an einem früheren Tag gab es noch < 100 % (also noch kein durchgehender 100%-Durchmarsch):
      // Themen mit längerer 100%-Serie bekommen weniger als Themen, die erst gestern zum ersten Mal 100% hatten,
      // aber die Gesamtsumme bleibt bei totalCount.
      const weights = topicMeta.map((m) => ({
        id: m.id,
        weight: (m.streak100 >= 2 ? 0.55 : 1.0) + 2.5 * (1 - m.overallAcc),
      }));
      const sumWeights = weights.reduce((acc, item) => acc + item.weight, 0) || 1;
      topicMeta.forEach((m) => {
        counts[m.id] = minRetention;
        assigned += minRetention;
      });
      const remaining = Math.max(0, totalCount - assigned);
      const fractional = weights.map((item) => {
        const exact = (item.weight / sumWeights) * remaining;
        const floor = Math.floor(exact);
        counts[item.id] += floor;
        assigned += floor;
        return { id: item.id, rem: exact - floor };
      });
      fractional.sort((a, b) => b.rem - a.rem);
      let idx = 0;
      while (assigned < totalCount && fractional.length > 0) {
        counts[fractional[idx % fractional.length].id] += 1;
        assigned += 1;
        idx += 1;
      }
    }

    // Themen-Plan-Array erstellen (nach Themen gruppiert für saubere Aufgabenblöcke)
    const planArray = [];
    topicIds.forEach((id) => {
      const n = counts[id] || 0;
      for (let i = 0; i < n; i += 1) {
        planArray.push(id);
      }
    });
    return planArray;
  }

  function generateAdaptiveExamTasks(plan, dayNumber) {
    const planTopicList = computeAdaptiveTopicQuotas(plan, dayNumber);
    const seed = `exam-${plan.id}-d${dayNumber}`;

    return runWithSeed(seed, () => {
      const created = [];
      const seen = new Set();

      // 1. Zuerst bis zu 25 % (mind. 4, max. 8) "Schwesteraufgaben" aus dem Fehler-Pool vom Vortag einstreuen,
      //    aber immer nur so viele, wie für dieses Thema im heutigen Kontingent (remainingPlan) auch vorgesehen sind!
      const remainingPlan = [...planTopicList];
      const errorPool = Array.isArray(plan.errorPool) ? plan.errorPool : [];
      const maxSisters = Math.max(4, Math.round((plan.dailyCount || 20) * 0.2));
      const sisterSlots = Math.min(maxSisters, errorPool.length);

      for (let s = 0; s < sisterSlots; s += 1) {
        const errItem = errorPool[s];
        if (!errItem || !getTopic(errItem.type)) continue;
        const pos = remainingPlan.indexOf(errItem.type);
        if (pos < 0) continue; // Verhindert, dass ein anderes Thema ungewollt gekürzt wird!

        for (let attempt = 0; attempt < 40; attempt += 1) {
          const candidate = generateTask(plan.grade, plan.term, errItem.type, negativesAllowed());
          const key = taskKey(candidate);
          if (!seen.has(key)) {
            seen.add(key);
            candidate.isSisterTask = true;
            created.push(candidate);
            remainingPlan.splice(pos, 1);
            break;
          }
        }
      }

      // 2. Schwierigkeits-Steigerung über die Tage:
      // An Tag 1 im 2. Halbjahr starten die ersten ~40 % der Aufgaben zum Warmwerden im 1.-Halbjahr-Zahlenraum
      remainingPlan.forEach((topicId, index) => {
        const topic = getTopic(topicId);
        const canWarmupTerm1 =
          dayNumber === 1 &&
          plan.term === 2 &&
          index % 3 === 0 &&
          topic &&
          isTopicAllowed(topic, plan.grade, 1);
        const effectiveTerm = canWarmupTerm1 ? 1 : plan.term;

        let added = false;
        for (let attempt = 0; attempt < 80; attempt += 1) {
          const task = generateTask(plan.grade, effectiveTerm, topicId, negativesAllowed());
          const key = taskKey(task);
          if (seen.has(key)) continue;
          seen.add(key);
          created.push(task);
          added = true;
          break;
        }
        if (!added) {
          created.push(generateTask(plan.grade, effectiveTerm, topicId, negativesAllowed()));
        }
      });

      // Sortiere nach Themen-Reihenfolge des Plans, damit die Darstellung ordentlich gebündelt ist
      const orderMap = new Map(plan.topicIds.map((id, i) => [id, i]));
      created.sort((a, b) => (orderMap.get(a.type) ?? 99) - (orderMap.get(b.type) ?? 99));
      return created;
    });
  }

  function buildStudentBriefingHtml(plan, dayNumber, dayTasks) {
    const isFinalDay = dayNumber >= plan.totalDays;
    const prevDay =
      plan.daysHistory && plan.daysHistory.length
        ? plan.daysHistory[plan.daysHistory.length - 1]
        : null;

    // Zähle, wie viele Aufgaben heute pro Thema dran sind
    const topicCounts = {};
    dayTasks.forEach((t) => {
      topicCounts[t.type] = (topicCounts[t.type] || 0) + 1;
    });

    const pillsHtml = Object.entries(topicCounts)
      .map(([topicId, count]) => {
        const label = topicDisplayName(topicId, plan.grade);
        return `<span class="exam-topic-pill"><strong>${count}&times;</strong> ${escapeHtml(label)}</span>`;
      })
      .join("");

    let headline = "";
    let explanation = "";

    if (dayNumber === 1 || !prevDay) {
      headline = `Tag 1 von ${plan.totalDays}: Dein Start-Check für die Mathe-Arbeit`;
      explanation = `Heute schauen wir uns alle <strong>${plan.topicIds.length} Prüfungsthemen</strong> gleichmäßig an (${dayTasks.length} Aufgaben). Rechne in Ruhe los: Was heute schon sicher klappt, wird ab morgen kürzer gehalten — und wo du noch überlegen musst, hilft dir der Trainingsplan ab morgen gezielt weiter!`;
    } else {
      const entries = Object.entries(prevDay.topicStats || {}).map(([id, st]) => ({
        id,
        label: topicDisplayName(id, plan.grade),
        acc: st.total > 0 ? Math.round((st.firstTryCorrect / st.total) * 100) : 0,
        firstTryCorrect: st.firstTryCorrect,
        total: st.total,
      }));
      entries.sort((a, b) => b.acc - a.acc);
      const strongest = entries[0];
      const weakest = entries[entries.length - 1];

      if (isFinalDay) {
        headline = `Tag ${dayNumber} von ${plan.totalDays}: Große Generalprobe vor der Mathe-Arbeit!`;
      } else {
        headline = `Tag ${dayNumber} von ${plan.totalDays}: Gezieltes Aufbautraining`;
      }

      if (isEveryTopicAllDays100Pct(plan.daysHistory, plan.topicIds)) {
        headline = `Tag ${dayNumber} von ${plan.totalDays}: Meister-Bonus (bisher 100 % fehlerfrei!)`;
        explanation = `Wahnsinn — du hattest bisher an jedem einzelnen Tag in <strong>allen Themen 100&nbsp;% im 1.&nbsp;Versuch richtig</strong>! Als Belohnung ist dein heutiges Übungsblatt auf <strong>${dayTasks.length} statt ${plan.dailyCount} Aufgaben</strong> verkürzt, damit du die Themen nur noch locker wachhältst.`;
      } else if (strongest && weakest && strongest.id !== weakest.id && strongest.acc === 100 && weakest.acc < 100) {
        const strongCount = topicCounts[strongest.id] || 0;
        const weakCount = topicCounts[weakest.id] || 0;
        explanation = `Bei <strong>${escapeHtml(strongest.label)}</strong> hattest du zuletzt <strong>100&nbsp;%</strong> direkt im 1.&nbsp;Versuch richtig — deshalb sind davon heute nur noch <strong>${strongCount}&nbsp;Aufgaben</strong> zum Wachhalten dabei. Die gesparten Aufgaben gehen in <strong>${escapeHtml(weakest.label)}</strong> (heute <strong>${weakCount}&nbsp;Aufgaben</strong>, zuletzt ${weakest.acc}&nbsp;%), damit auch das bis zur Arbeit auf 100&nbsp;% kommt!`;
      } else if (strongest && weakest && strongest.id !== weakest.id && weakest.acc < 85) {
        explanation = `Am letzten Trainingstag lief <strong>${escapeHtml(strongest.label)}</strong> schon richtig gut (<strong>${strongest.acc}&nbsp;%</strong> direkt im 1.&nbsp;Versuch richtig). Bei <strong>${escapeHtml(weakest.label)}</strong> (${weakest.acc}&nbsp;% im 1.&nbsp;Versuch) gab es noch ein paar Wackler, deshalb üben wir das heute ausführlicher mit frischen Zahlen.`;
      } else if (strongest && weakest && weakest.acc >= 85) {
        explanation = `Stark! Du hattest zuletzt in allen Themen schon mindestens 85&nbsp;% direkt im 1.&nbsp;Versuch richtig. Heute trainierst du auf vollem Prüfungs-Niveau Richtung 100&nbsp;%, damit für die Mathe-Arbeit alles sicher sitzt.`;
      } else {
        explanation = `Heute wiederholen wir deine Themen aus der Mathe-Arbeit mit neuen Zahlen und etwas höherem Anspruch, damit du Schritt für Schritt sicherer wirst.`;
      }
    }

    return `
      <div class="exam-briefing-card">
        <div class="exam-briefing-top">
          <span class="exam-briefing-badge">${escapeHtml(formatExamCountdownText(plan))}</span>
          <span class="exam-briefing-rule">1. Prüfen = Wertung · Danach Fehler korrigieren</span>
        </div>
        <h3 class="exam-briefing-title">${escapeHtml(headline)}</h3>
        <p class="exam-briefing-text">${explanation}</p>
        <div class="exam-briefing-pills" aria-label="Heutige Aufgabenverteilung">
          ${pillsHtml}
        </div>
      </div>
    `;
  }

  function renderSvgProgressChart(plan) {
    const history = plan.daysHistory || [];
    if (!history.length) {
      return "";
    }

    const totalDays = Math.max(plan.totalDays || 5, history.length);
    const width = 620;
    const height = 230;
    const padLeft = 44;
    const padRight = 24;
    const padTop = 22;
    const padBottom = 38;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const xForDay = (dayNum) => {
      if (totalDays <= 1) return padLeft + plotW / 2;
      return padLeft + ((dayNum - 1) / (totalDays - 1)) * plotW;
    };
    const yForPct = (pct) => {
      const clamped = Math.max(0, Math.min(100, pct));
      return padTop + plotH - (clamped / 100) * plotH;
    };

    // Horizontale Hilfslinien (0%, 50%, 85% Ziel, 100%)
    const gridLevels = [0, 50, 100];
    const gridLines = gridLevels
      .map((pct) => {
        const y = yForPct(pct).toFixed(1);
        return `
          <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#e4dccb" stroke-width="1" />
          <text x="${padLeft - 8}" y="${Number(y) + 4}" text-anchor="end" font-size="11" fill="#5b6573">${pct}%</text>
        `;
      })
      .join("");

    // 85%-Ziellinie ("Sicher für die Arbeit")
    const y85 = yForPct(85).toFixed(1);
    const targetLine = `
      <line x1="${padLeft}" y1="${y85}" x2="${width - padRight}" y2="${y85}" stroke="#2f6b45" stroke-width="1.8" stroke-dasharray="5,4" />
      <rect x="${width - padRight - 148}" y="${Number(y85) - 18}" width="146" height="16" rx="4" fill="#e7f4ea" />
      <text x="${width - padRight - 75}" y="${Number(y85) - 7}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#2f6b45">Ziel: Sicher ab 85 %</text>
    `;

    // X-Achsen-Tage
    const xLabels = Array.from({ length: totalDays }, (_, idx) => {
      const d = idx + 1;
      const x = xForDay(d).toFixed(1);
      const isDone = history.some((h) => h.day === d);
      return `
        <text x="${x}" y="${height - 12}" text-anchor="middle" font-size="11.5" font-weight="${isDone ? "700" : "400"}" fill="${isDone ? "#1c2430" : "#8b94a0"}">Tag ${d}</text>
      `;
    }).join("");

    // Linien pro Thema
    const seriesHtml = plan.topicIds
      .map((topicId, idx) => {
        const color = CHART_COLORS[idx % CHART_COLORS.length];
        const points = [];
        history.forEach((dayEntry) => {
          const st = dayEntry.topicStats?.[topicId];
          if (st && st.total > 0) {
            const pct = Math.round((st.firstTryCorrect / st.total) * 100);
            points.push({
              day: dayEntry.day,
              x: xForDay(dayEntry.day),
              y: yForPct(pct),
              pct,
            });
          }
        });
        if (!points.length) return "";
        const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const circles = points
          .map(
            (p) =>
              `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="${color}" stroke="#fffdf8" stroke-width="1.8"><title>${escapeHtml(topicDisplayName(topicId, plan.grade))} – Tag ${p.day}: ${p.pct} % im 1. Versuch</title></circle>`
          )
          .join("");
        return `
          <polyline fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
          ${circles}
        `;
      })
      .join("");

    const legendHtml = plan.topicIds
      .map((topicId, idx) => {
        const color = CHART_COLORS[idx % CHART_COLORS.length];
        const latestDay = history[history.length - 1];
        const st = latestDay?.topicStats?.[topicId];
        const pctText =
          st && st.total > 0 ? `${Math.round((st.firstTryCorrect / st.total) * 100)} %` : "–";
        return `
          <span class="exam-chart-legend-item">
            <span class="exam-chart-dot" style="background:${color}"></span>
            <span>${escapeHtml(topicDisplayName(topicId, plan.grade))} (<strong>${pctText}</strong>)</span>
          </span>
        `;
      })
      .join("");

    return `
      <div class="exam-chart-wrap">
        <div class="exam-chart-header">
          <h4>Deine Lernkurve (Erstversuch-Quote pro Thema)</h4>
          <span>Grüne Linie = 85 % Prüfungsreife</span>
        </div>
        <svg class="exam-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Lernkurve über die Trainingstage">
          ${gridLines}
          ${targetLine}
          ${xLabels}
          ${seriesHtml}
        </svg>
        <div class="exam-chart-legend">
          ${legendHtml}
        </div>
      </div>
    `;
  }

  function renderDaySummaryCard(plan, completedDayRecord) {
    if (!summaryEl) return;

    const firstTryPct =
      completedDayRecord.total > 0
        ? Math.round((completedDayRecord.firstTryCorrect / completedDayRecord.total) * 100)
        : 100;
    const correctedCount = Math.max(
      0,
      completedDayRecord.total - completedDayRecord.firstTryCorrect
    );
    const hasMoreDays = completedDayRecord.day < plan.totalDays;

    const topicRowsHtml = Object.entries(completedDayRecord.topicStats || {})
      .map(([topicId, st]) => {
        const pct = st.total > 0 ? Math.round((st.firstTryCorrect / st.total) * 100) : 100;
        const isReady = pct >= 85;
        const statusBadge = isReady
          ? `<span class="exam-topic-status is-strong">Sitzt sicher (${pct} %)</span>`
          : `<span class="exam-topic-status is-focus">Wird weiter geübt (${pct} %)</span>`;
        return `
          <div class="exam-summary-topic-row">
            <span class="exam-summary-topic-name">${escapeHtml(topicDisplayName(topicId, plan.grade))}</span>
            <span class="exam-summary-topic-score">${st.firstTryCorrect} von ${st.total} sofort richtig</span>
            ${statusBadge}
          </div>
        `;
      })
      .join("");

    let outlookText = "";
    if (hasMoreDays) {
      const weakTopics = Object.entries(completedDayRecord.topicStats || {})
        .filter(([, st]) => st.total > 0 && st.firstTryCorrect / st.total < 0.85)
        .map(([id]) => topicDisplayName(id, plan.grade));

      if (weakTopics.length > 0) {
        outlookText = `<strong>Ausblick auf Tag ${completedDayRecord.day + 1}:</strong> Morgen legt dein Trainingsplan den Schwerpunkt auf <strong>${escapeHtml(weakTopics.join(" und "))}</strong> (inklusive Schwesteraufgaben zu deinen heutigen Fehlern). Starke Themen bleiben kurz zum Wachhalten dabei.`;
      } else {
        outlookText = `<strong>Ausblick auf Tag ${completedDayRecord.day + 1}:</strong> Überall mindestens 85 %! Morgen bekommst du einen abwechslungsreichen Profi-Mix über alle Themen, damit die Form bis zur Arbeit bleibt.`;
      }
    } else {
      outlookText = `<strong>Geschafft!</strong> Du hast alle ${plan.totalDays} Trainingstage abgeschlossen und alle Aufgaben gelöst. Viel Erfolg bei deiner Mathe-Arbeit!`;
    }

    const nextActionBtn = hasMoreDays
      ? `<button type="button" class="create-btn" id="exam-next-day-btn">Tag ${completedDayRecord.day + 1} von ${plan.totalDays} starten</button>`
      : `<button type="button" class="create-btn" id="exam-bonus-day-btn">Zusätzliche Generalprobe starten</button>`;

    summaryEl.innerHTML = `
      <div class="exam-summary-card">
        <div class="exam-summary-header">
          <span class="exam-plan-kicker">Tages-Fazit · Tag ${completedDayRecord.day} von ${plan.totalDays} erledigt</span>
          <h3>${
            correctedCount === 0
              ? `Perfekt! Alle ${completedDayRecord.total} Aufgaben direkt im 1. Versuch richtig (100 %)`
              : `${completedDayRecord.firstTryCorrect} von ${completedDayRecord.total} Aufgaben (${firstTryPct} %) sofort richtig — ${correctedCount} ${correctedCount === 1 ? "Fehler" : "Fehler"} erfolgreich verbessert!`
          }</h3>
        </div>

        <div class="exam-summary-topics">
          ${topicRowsHtml}
        </div>

        <p class="exam-summary-outlook">${outlookText}</p>

        ${renderSvgProgressChart(plan)}

        <div class="exam-summary-actions">
          ${nextActionBtn}
          <button type="button" class="grade-btn" id="exam-copy-link-btn">Lernplan-Link sichern</button>
        </div>
      </div>
    `;
    summaryEl.classList.remove("is-hidden");

    const nextBtn = document.getElementById("exam-next-day-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const latestPlan = loadExamPlan();
        if (latestPlan) {
          startExamTrainingDay(latestPlan);
        }
      });
    }

    const bonusBtn = document.getElementById("exam-bonus-day-btn");
    if (bonusBtn) {
      bonusBtn.addEventListener("click", () => {
        const latestPlan = loadExamPlan();
        if (latestPlan) {
          latestPlan.totalDays += 1;
          latestPlan.currentDay = latestPlan.totalDays;
          saveExamPlan(latestPlan);
          startExamTrainingDay(latestPlan);
        }
      });
    }

    const copyBtn = document.getElementById("exam-copy-link-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const url = buildBackupLink(plan);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).then(() => {
            copyBtn.textContent = "Link kopiert!";
            setTimeout(() => {
              copyBtn.textContent = "Lernplan-Link sichern";
            }, 2200);
          });
        }
      });
    }
  }

  function startExamTrainingDay(plan) {
    if (!plan) return;
    const lockedGrade = getLockedGrade();
    if (lockedGrade && lockedGrade !== plan.grade) {
      const token = encodePlanToUrlParam(plan);
      window.location.href = `/klasse-${plan.grade}/uebungen${token ? `?lernplan=${encodeURIComponent(token)}` : ""}`;
      return;
    }

    if (successDialog && successDialog.open) {
      successDialog.close();
    }
    stopFireworks();

    // Synchronisiere Klasse und Halbjahr der Seite
    selectGrade(plan.grade, { scroll: false });
    selectTerm(plan.term, { scroll: false });

    const dayNumber = Math.min(plan.currentDay, plan.totalDays);

    // Bei mittleren/späteren Tagen in Klasse 3 großes Einmaleins aktivieren, falls vorhanden
    if (plan.grade === 3 && largeMulToggle) {
      largeMulToggle.checked = plan.term === 2 && dayNumber > 1;
    }

    tasks = generateAdaptiveExamTasks(plan, dayNumber);
    activeTopicIds = [...plan.topicIds];
    activeBlockMode = true;
    activeSheetSeed = `exam-${plan.id}-d${dayNumber}`;
    celebrated = false;

    activeExamSession = {
      dayNumber,
      firstCheckDone: false,
      checkAttempts: 0,
      firstTryByTopic: {},
      firstTryCorrect: 0,
      firstTryWrongTasks: [],
    };

    if (summaryEl) {
      summaryEl.classList.add("is-hidden");
      summaryEl.innerHTML = "";
    }

    setNotesEnabled(notesToggle.checked, false);
    renderTasks();

    if (briefingEl) {
      briefingEl.innerHTML = buildStudentBriefingHtml(plan, dayNumber, tasks);
      briefingEl.classList.remove("is-hidden");
    }

    statusEl.textContent = `Tag ${dayNumber} von ${plan.totalDays} ist bereit. Klicke auf „Aufgaben beginnen“, wenn du loslegen möchtest.`;
    if (checkBtn) {
      checkBtn.textContent = "Prüfen";
    }

    armTimers();
    setPracticeLocked(true);
    hideAds();
    show(worksheet);
    show(startBtn);
    startBtn.disabled = false;
    show(checkBtn);
    show(pdfBtn);
    show(pdfSolutionsBtn);
    hide(newSheetBtn);
    hide(progressEl);
    progressEl.textContent = "";
    if (countdownActive) {
      show(countdownEl);
    } else {
      hide(countdownEl);
    }

    renderEntryBanner();
    scrollToNext(worksheet, "start");
  }

  window.onExamPlanCheckEvaluated = function ({ rows, correct, allSolved }) {
    if (!activeExamSession) {
      if (!allSolved) {
        statusEl.textContent = `${correct} von ${tasks.length} richtig. Falsche oder leere Felder kannst du noch ausfüllen.`;
      }
      return;
    }

    const plan = loadExamPlan();
    if (!plan) {
      return;
    }

    activeExamSession.checkAttempts += 1;

    // 1. Stufe: Beim allerersten Klick auf "Prüfen" wird die ehrliche Erstversuch-Quote eingefroren
    if (!activeExamSession.firstCheckDone) {
      activeExamSession.firstCheckDone = true;
      const byTopic = {};
      const wrongPool = [];
      let firstCorrectCount = 0;

      rows.forEach((row) => {
        const index = Number(row.dataset.index);
        const task = tasks[index];
        if (!task) return;
        if (!byTopic[task.type]) {
          byTopic[task.type] = { firstTryCorrect: 0, total: 0 };
        }
        byTopic[task.type].total += 1;

        const isRowCorrect = row.classList.contains("is-correct");
        if (isRowCorrect) {
          byTopic[task.type].firstTryCorrect += 1;
          firstCorrectCount += 1;
        } else {
          wrongPool.push({
            type: task.type,
            operation: task.operation || "",
          });
        }
      });

      activeExamSession.firstTryByTopic = byTopic;
      activeExamSession.firstTryCorrect = firstCorrectCount;
      activeExamSession.firstTryWrongTasks = wrongPool;
    }

    const remainingWrong = tasks.length - correct;

    if (!allSolved) {
      const firstPct = Math.round((activeExamSession.firstTryCorrect / tasks.length) * 100);
      if (activeExamSession.checkAttempts === 1) {
        statusEl.textContent = `1. Versuch gespeichert (${activeExamSession.firstTryCorrect} von ${tasks.length} direkt richtig = ${firstPct} %). Jetzt noch die ${remainingWrong} offenen Aufgaben korrigieren, um Tag ${activeExamSession.dayNumber} abzuschließen!`;
      } else {
        statusEl.textContent = `Schon ${correct} von ${tasks.length} gelöst! Noch ${remainingWrong} ${remainingWrong === 1 ? "Aufgabe" : "Aufgaben"} verbessern, damit der Trainingstag komplett ist.`;
      }
      if (checkBtn) {
        checkBtn.textContent = "Korrektur prüfen";
      }
      return;
    }

    // 2. Stufe: Alle Aufgaben (inkl. Nachbesserung) sind gelöst -> Tag im Lernplan abschließen!
    if (checkBtn) {
      checkBtn.textContent = "Prüfen";
    }

    const completedDayRecord = {
      day: activeExamSession.dayNumber,
      date: new Date().toISOString().slice(0, 10),
      firstTryCorrect: activeExamSession.firstTryCorrect,
      total: tasks.length,
      attemptsNeeded: activeExamSession.checkAttempts,
      topicStats: activeExamSession.firstTryByTopic,
    };

    if (!Array.isArray(plan.daysHistory)) {
      plan.daysHistory = [];
    }
    const existingIdx = plan.daysHistory.findIndex((d) => d.day === completedDayRecord.day);
    if (existingIdx >= 0) {
      plan.daysHistory[existingIdx] = completedDayRecord;
    } else {
      plan.daysHistory.push(completedDayRecord);
    }

    plan.errorPool = activeExamSession.firstTryWrongTasks.slice(0, 10);
    if (plan.currentDay <= activeExamSession.dayNumber) {
      plan.currentDay = activeExamSession.dayNumber + 1;
    }

    saveExamPlan(plan);
    renderEntryBanner();
    renderDaySummaryCard(plan, completedDayRecord);

    statusEl.textContent = `Klasse! Tag ${completedDayRecord.day} von ${plan.totalDays} ist komplett gelöst (${completedDayRecord.firstTryCorrect}/${completedDayRecord.total} im 1. Versuch richtig). Unten siehst du dein Tages-Fazit und deine Lernkurve.`;
  };

  function renderEntryBanner() {
    const plan = loadExamPlan();
    if (!plan) {
      if (entryTitle) {
        entryTitle.textContent = "Steht bald eine Mathe-Arbeit an?";
      }
      if (entryDesc) {
        entryDesc.textContent =
          "Erstelle einen täglichen Trainingsplan bis zum Prüfungstag — die Aufgaben passen sich jeden Tag automatisch an deine Ergebnisse vom Vortag an.";
      }
      if (openBtn) {
        openBtn.textContent = "Für Mathe-Arbeit üben";
      }
      if (activeBar) {
        activeBar.classList.add("is-hidden");
        activeBar.innerHTML = "";
      }
      return;
    }

    const isDone = plan.currentDay > plan.totalDays;
    const topicNames = plan.topicIds
      .map((id) => topicDisplayName(id, plan.grade))
      .join(", ");

    if (entryTitle) {
      entryTitle.textContent = isDone
        ? `Dein Mathe-Trainingsplan (Klasse ${plan.grade}) ist komplett!`
        : `Aktiver Trainingsplan · Klasse ${plan.grade} (${plan.term}. Halbjahr)`;
    }
    if (entryDesc) {
      entryDesc.textContent = `Themen der Arbeit: ${topicNames} · ${plan.dailyCount} Aufgaben pro Tag`;
    }
    if (openBtn) {
      openBtn.textContent = "Plan anpassen / Neu";
    }

    if (activeBar) {
      const doneDays = (plan.daysHistory || []).length;
      const pctDone = Math.min(100, Math.round((doneDays / plan.totalDays) * 100));
      const continueLabel = isDone
        ? "Generalprobe noch einmal üben"
        : `Tag ${plan.currentDay} von ${plan.totalDays} jetzt starten`;

      activeBar.innerHTML = `
        <div class="exam-active-progress-row">
          <div class="exam-active-info">
            <span class="exam-active-status-badge">${escapeHtml(formatExamCountdownText(plan))}</span>
            <span class="exam-active-device-note">Lokal in diesem Browser gespeichert — bitte immer am selben Gerät üben.</span>
          </div>
          <div class="exam-active-buttons">
            <button type="button" class="create-btn exam-continue-btn" id="exam-plan-continue-btn">${escapeHtml(continueLabel)}</button>
            <button type="button" class="exam-plan-mini-btn" id="exam-plan-share-btn" title="Backup-Link für dieses oder ein anderes Gerät kopieren">Link sichern</button>
            <button type="button" class="exam-plan-mini-btn exam-plan-delete-btn" id="exam-plan-delete-btn">Plan beenden</button>
          </div>
        </div>
        <div class="exam-active-bar-track" role="progressbar" aria-valuenow="${pctDone}" aria-valuemin="0" aria-valuemax="100">
          <div class="exam-active-bar-fill" style="width:${pctDone}%"></div>
        </div>
      `;
      activeBar.classList.remove("is-hidden");

      document.getElementById("exam-plan-continue-btn")?.addEventListener("click", () => {
        const current = loadExamPlan();
        if (current) {
          startExamTrainingDay(current);
        }
      });

      document.getElementById("exam-plan-share-btn")?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const url = buildBackupLink(plan);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).then(() => {
            btn.textContent = "Kopiert!";
            setTimeout(() => {
              btn.textContent = "Link sichern";
            }, 2000);
          });
        }
      });

      document.getElementById("exam-plan-delete-btn")?.addEventListener("click", () => {
        clearSavedExamPlan();
        clearExamDayCards();
        renderEntryBanner();
      });
    }
  }

  // Event-Listener für Setup-Dialog
  openBtn?.addEventListener("click", openExamPlanDialog);
  closeXBtn?.addEventListener("click", () => dialog.close());
  cancelBtn?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  gradeSelect?.addEventListener("change", () => {
    userOverrodeDailyCount = false;
    renderDialogTopics(Number(gradeSelect.value), Number(termSelect.value));
  });

  termSelect?.addEventListener("change", () => {
    userOverrodeDailyCount = false;
    renderDialogTopics(Number(gradeSelect.value), Number(termSelect.value));
  });

  daysSelect?.addEventListener("change", () => {
    if (dateInput) {
      dateInput.value = "";
    }
    updateSubmitButtonLabel();
  });

  dateInput?.addEventListener("change", () => {
    if (!dateInput.value) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(`${dateInput.value}T00:00:00`);
    const diffDays = Math.round((examDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      const clamped = Math.min(14, Math.max(2, diffDays));
      if (daysSelect) {
        // Falls Option nicht existiert, füge sie dynamisch hinzu
        if (![...daysSelect.options].some((opt) => Number(opt.value) === clamped)) {
          const opt = document.createElement("option");
          opt.value = String(clamped);
          opt.textContent = `${clamped} Tage (bis zur Arbeit)`;
          daysSelect.append(opt);
        }
        daysSelect.value = String(clamped);
      }
      updateSubmitButtonLabel();
    }
  });

  selectAllBtn?.addEventListener("click", () => {
    userOverrodeDailyCount = false;
    topicsListEl
      ?.querySelectorAll("input[data-exam-topic]")
      .forEach((input) => (input.checked = true));
    syncDailyCountRecommendation();
  });

  selectNoneBtn?.addEventListener("click", () => {
    userOverrodeDailyCount = false;
    topicsListEl
      ?.querySelectorAll("input[data-exam-topic]")
      .forEach((input) => (input.checked = false));
    syncDailyCountRecommendation();
  });

  topicsListEl?.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.hasAttribute("data-exam-topic")) {
      userOverrodeDailyCount = false;
      if (errorEl) {
        errorEl.classList.add("is-hidden");
      }
      syncDailyCountRecommendation();
    }
  });

  dailyCountSelect?.addEventListener("change", () => {
    userOverrodeDailyCount = true;
  });

  submitBtn?.addEventListener("click", () => {
    const grade = Number(gradeSelect?.value) || 3;
    const term = Number(termSelect?.value) === 1 ? 1 : 2;
    const totalDays = Math.min(14, Math.max(2, Number(daysSelect?.value) || 5));
    const dailyCount = Number(dailyCountSelect?.value) || 20;
    const chosenTopics = [
      ...(topicsListEl?.querySelectorAll("input[data-exam-topic]:checked") || []),
    ].map((el) => el.dataset.examTopic);

    if (!chosenTopics.length) {
      if (errorEl) {
        errorEl.textContent =
          "Bitte wähle mindestens ein Thema aus, das in der Mathe-Arbeit drankommt.";
        errorEl.classList.remove("is-hidden");
      }
      return;
    }

    const newPlan = {
      id: `plan-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      grade,
      term,
      totalDays,
      dailyCount,
      examDate: dateInput?.value || "",
      topicIds: chosenTopics,
      currentDay: 1,
      daysHistory: [],
      errorPool: [],
    };

    saveExamPlan(newPlan);
    dialog.close();
    startExamTrainingDay(newPlan);
  });

  // URL-Parameter ?lernplan=... beim Seitenstart prüfen
  const params = new URLSearchParams(window.location.search);
  const urlPlanToken = params.get("lernplan");
  if (urlPlanToken) {
    const restored = decodePlanFromUrlParam(urlPlanToken);
    if (restored) {
      saveExamPlan(restored);
      renderEntryBanner();
      startExamTrainingDay(restored);
      return;
    }
  }

  renderEntryBanner();
})();
