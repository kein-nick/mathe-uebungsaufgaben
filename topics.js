function buildTopics(u) {
  const {
    randomInt,
    pickValue,
    difficulty,
    withSigns,
    symbols,
  } = u;

  const GROUP = {
    rechnen: "Rechnen",
    zahlen: "Zahlen",
    groessen: "Größen",
    geometrie: "Geometrie",
  };

  function pick(items) {
    return items[randomInt(0, items.length - 1)];
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = randomInt(0, index);
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return x || 1;
  }

  function levelOf(grade, term) {
    return difficulty[grade][term];
  }

  function addMax(grade, term) {
    return levelOf(grade, term).addMax;
  }

  function addMinOf(grade, term) {
    return levelOf(grade, term).addMin ?? 0;
  }

  function gradeNum(grade, term, extraMin = 0, extraMax = null) {
    const min = Math.max(extraMin, addMinOf(grade, term));
    const max = extraMax == null ? addMax(grade, term) : Math.min(extraMax, addMax(grade, term));
    if (max <= min) {
      return min;
    }
    return randomInt(min, max);
  }

  function mentalBand(grade, term) {
    const table = {
      3: { 1: { min: 2, max: 9 }, 2: { min: 3, max: 12 } },
      4: { 1: { min: 4, max: 14 }, 2: { min: 6, max: 20 } },
      5: { 1: { min: 6, max: 20 }, 2: { min: 8, max: 32 } },
      6: { 1: { min: 8, max: 28 }, 2: { min: 12, max: 48 } },
    };
    return table[grade]?.[term] || { min: 2, max: 9 };
  }

  function mentalNum(grade, term, extraMin = 0, extraMax = null) {
    const band = mentalBand(grade, term);
    const min = Math.max(extraMin, band.min);
    const max = extraMax == null ? band.max : Math.min(extraMax, band.max);
    if (max <= min) {
      return min;
    }
    return randomInt(min, max);
  }

  function samplePair(grade, term) {
    const max = addMax(grade, term);
    const a = Math.min(max, Math.max(6, Math.round(max * 0.7)));
    const b = Math.min(Math.max(2, Math.round(max * 0.35)), a - 1 || a);
    return { a, b };
  }

  function fmt(n) {
    if (typeof n === "number" && !Number.isInteger(n)) {
      return String(n).replace(".", ",").replace("-", "−");
    }
    const sign = n < 0 ? "−" : "";
    return sign + Math.abs(n).toLocaleString("de-DE");
  }

  function niceNumber(max, min = 2) {
    if (max <= min) {
      return min;
    }
    return randomInt(min, max);
  }

  function roundTo(value, step) {
    return Math.round(value / step) * step;
  }

  function toRoman(value) {
    const map = [
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let rest = value;
    let out = "";
    map.forEach(([num, glyph]) => {
      while (rest >= num) {
        out += glyph;
        rest -= num;
      }
    });
    return out;
  }

  function svg(inner, w = 140, h = 90) {
    return `<svg class="geo-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" overflow="visible" aria-hidden="true">${inner}</svg>`;
  }

  function answerKeyPart(answer) {
    if (answer != null && typeof answer === "object") {
      return JSON.stringify(answer);
    }
    return String(answer);
  }

  function numberTask(type, prompt, answer, extra = {}) {
    return {
      type,
      kind: extra.kind || "number",
      prompt,
      promptHtml: extra.promptHtml,
      visualHtml: extra.visualHtml,
      answer,
      a: extra.a,
      b: extra.b,
      operation: extra.operation,
      wide: extra.wide,
      allowMinus: extra.allowMinus,
      answerLabel: extra.answerLabel,
      key: extra.key || `${type}:${prompt}:${answerKeyPart(answer)}`,
    };
  }

  function choiceTask(type, prompt, answer, choices, extra = {}) {
    const mapped = choices.map((item) =>
      typeof item === "string" ? { value: item, label: item } : item
    );
    return {
      type,
      kind: "choice",
      prompt,
      promptHtml: extra.promptHtml,
      visualHtml: extra.visualHtml,
      answer: String(answer),
      choices: extra.shuffle === false ? mapped : shuffle(mapped),
      key: extra.key || `${type}:${answer}:${prompt}`,
    };
  }

  function randomAddends(min, max) {
    const low = Math.max(0, min);
    if (max < low * 2) {
      const a = randomInt(0, max);
      const b = randomInt(0, max - a);
      return { a, b };
    }
    const a = randomInt(low, max - low);
    const b = randomInt(low, max - a);
    return { a, b };
  }

  function randomSubtractPair(min, max) {
    const low = Math.max(0, min);
    if (max < low * 2) {
      const a = randomInt(low, max);
      const b = randomInt(0, a);
      return { a, b };
    }
    const a = randomInt(low * 2, max);
    const b = randomInt(low, a - low);
    return { a, b };
  }

  function addendCount(grade) {
    if (grade < 3) {
      return 2;
    }
    const roll = randomInt(1, 10);
    if (grade === 3) {
      if (roll <= 5) {
        return 2;
      }
      if (roll <= 9) {
        return 3;
      }
      return 4;
    }
    if (roll <= 4) {
      return 2;
    }
    if (roll <= 8) {
      return 3;
    }
    return 4;
  }

  function multiAddendMax(grade, addMax, count) {
    if (count <= 2) {
      return addMax;
    }
    if (count === 4) {
      if (grade >= 5) {
        return Math.min(addMax, 999);
      }
      if (grade >= 4) {
        return Math.min(addMax, 499);
      }
      return Math.min(addMax, 99);
    }
    if (grade >= 5) {
      return Math.min(addMax, 9999);
    }
    if (grade >= 4) {
      return Math.min(addMax, 999);
    }
    return Math.min(addMax, 199);
  }

  function randomAddendList(min, max, count) {
    const low = Math.max(0, min);
    const high = Math.max(low, max);
    const numbers = [];
    for (let index = 0; index < count; index += 1) {
      numbers.push(randomInt(low, high));
    }
    return numbers;
  }

  function randomSubtractChain(min, max, count) {
    const low = Math.max(0, min);
    const high = Math.max(low, max);
    const subtrahends = [];
    for (let index = 0; index < count - 1; index += 1) {
      subtrahends.push(randomInt(low, high));
    }
    const subSum = subtrahends.reduce((sum, value) => sum + value, 0);
    const result = randomInt(0, high);
    return [subSum + result, ...subtrahends];
  }

  function makeAddSubTask(operation, operands) {
    const answer =
      operation === "addition"
        ? operands.reduce((sum, value) => sum + value, 0)
        : operands[0] - operands.slice(1).reduce((sum, value) => sum + value, 0);
    const symbol = operation === "addition" ? "+" : "−";
    const prompt = operands
      .map((value, index) => (index === 0 ? fmt(value) : `${symbol} ${fmt(value)}`))
      .join(" ");
    return numberTask(operation, prompt, answer, {
      a: operands[0],
      b: operands[1],
      operands,
      operation,
      key: `${operation}:${operands.join(":")}`,
    });
  }

  function genArithmetic(operation, grade, term, allowNegatives) {
    const base = levelOf(grade, term);
    const level = allowNegatives && base.neg ? { ...base, ...base.neg } : base;
    const addMin = level.addMin ?? 0;

    if (operation === "addition") {
      if (!allowNegatives) {
        const count = addendCount(grade);
        if (count === 2) {
          const pair = randomAddends(addMin, level.addMax);
          return makeAddSubTask(operation, [pair.a, pair.b]);
        }
        const cap = multiAddendMax(grade, level.addMax, count);
        const smallMin = Math.min(addMin, Math.max(1, Math.floor(cap / 20)));
        return makeAddSubTask(operation, randomAddendList(smallMin, cap, count));
      }
      const signed = withSigns(
        randomInt(Math.max(1, addMin), level.addMax),
        randomInt(Math.max(1, addMin), level.addMax),
        true
      );
      return numberTask("addition", "", signed.a + signed.b, {
        ...signed,
        operation,
        allowMinus: true,
        key: `${operation}:${signed.a}:${signed.b}`,
      });
    }

    if (operation === "subtraction") {
      if (!allowNegatives) {
        const count = addendCount(grade);
        if (count === 2) {
          const pair = randomSubtractPair(addMin, level.addMax);
          return makeAddSubTask(operation, [pair.a, pair.b]);
        }
        const cap = multiAddendMax(grade, level.addMax, count);
        const smallMin = Math.min(addMin, Math.max(1, Math.floor(cap / 20)));
        return makeAddSubTask(operation, randomSubtractChain(smallMin, cap, count));
      }
      const signed = withSigns(
        randomInt(Math.max(1, addMin), level.addMax),
        randomInt(Math.max(1, addMin), level.addMax),
        true
      );
      return numberTask("subtraction", "", signed.a - signed.b, {
        ...signed,
        operation,
        allowMinus: true,
        key: `${operation}:${signed.a}:${signed.b}`,
      });
    }

    if (operation === "multiplication") {
      const signed = withSigns(pickValue(level.mul.a), pickValue(level.mul.b), allowNegatives);
      return numberTask("multiplication", "", signed.a * signed.b, {
        ...signed,
        operation,
        allowMinus: allowNegatives,
        key: `${operation}:${signed.a}:${signed.b}`,
      });
    }

    const divisor = pickValue(level.div.divisors);
    const quotient = pickValue(level.div.quotient);
    const signed = withSigns(divisor, quotient, allowNegatives);
    return numberTask("division", "", signed.b, {
      a: signed.a * signed.b,
      b: signed.a,
      operation: "division",
      allowMinus: allowNegatives,
      key: `division:${signed.a * signed.b}:${signed.a}`,
    });
  }

  function exArith(grade, term, symbol) {
    const pair = samplePair(grade, term);
    return `z. B. ${fmt(pair.a)} ${symbol} ${fmt(pair.b)}`;
  }

  function shapeSvg(kind) {
    if (kind === "kreis") {
      return svg(`<circle cx="70" cy="45" r="28" fill="#7eb8a4" stroke="#1c2430" stroke-width="2"/>`);
    }
    if (kind === "dreieck") {
      return svg(`<polygon points="70,12 108,76 32,76" fill="#e7b07a" stroke="#1c2430" stroke-width="2"/>`);
    }
    if (kind === "quadrat") {
      return svg(`<rect x="42" y="16" width="56" height="56" fill="#d98b7a" stroke="#1c2430" stroke-width="2"/>`);
    }
    return svg(`<rect x="28" y="24" width="84" height="44" fill="#8fb3d9" stroke="#1c2430" stroke-width="2"/>`);
  }

  function clockSvg(hours, minutes) {
    const hAngle = ((hours % 12) + minutes / 60) * 30 - 90;
    const mAngle = minutes * 6 - 90;
    const rad = (deg) => (deg * Math.PI) / 180;
    const hx = 70 + 22 * Math.cos(rad(hAngle));
    const hy = 45 + 22 * Math.sin(rad(hAngle));
    const mx = 70 + 30 * Math.cos(rad(mAngle));
    const my = 45 + 30 * Math.sin(rad(mAngle));
    let ticks = "";
    for (let i = 0; i < 12; i += 1) {
      const a = rad(i * 30 - 90);
      const x1 = 70 + 34 * Math.cos(a);
      const y1 = 45 + 34 * Math.sin(a);
      const x2 = 70 + 38 * Math.cos(a);
      const y2 = 45 + 38 * Math.sin(a);
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1c2430" stroke-width="2"/>`;
    }
    return svg(
      `<circle cx="70" cy="45" r="40" fill="#fff" stroke="#1c2430" stroke-width="2"/>${ticks}
       <line x1="70" y1="45" x2="${hx}" y2="${hy}" stroke="#1c2430" stroke-width="3" stroke-linecap="round"/>
       <line x1="70" y1="45" x2="${mx}" y2="${my}" stroke="#c45c26" stroke-width="2" stroke-linecap="round"/>
       <circle cx="70" cy="45" r="3" fill="#1c2430"/>`,
      140,
      90
    );
  }

  const topics = [
    {
      id: "addition",
      label: "Addition",
      group: "rechnen",
      fromGrade: 1,
      fromTerm: 1,
      usesNegatives: true,
      example: (g, t) => exArith(g, t, "+"),
      generate: (g, t, extra) => genArithmetic("addition", g, t, extra.allowNegatives),
    },
    {
      id: "subtraction",
      label: "Subtraktion",
      group: "rechnen",
      fromGrade: 1,
      fromTerm: 1,
      usesNegatives: true,
      example: (g, t) => exArith(g, t, "−"),
      generate: (g, t, extra) => genArithmetic("subtraction", g, t, extra.allowNegatives),
    },
    {
      id: "multiplication",
      label: "Multiplikation",
      group: "rechnen",
      fromGrade: 2,
      fromTerm: 1,
      usesNegatives: true,
      example: (g, t) => {
        const mul = levelOf(g, t).mul;
        if (!mul) {
          return "z. B. 3 × 4";
        }
        const a = Array.isArray(mul.a) ? mul.a[0] : mul.a.min;
        const b = Array.isArray(mul.b) ? 5 : Math.min(5, mul.b.max);
        return `z. B. ${a} × ${b}`;
      },
      generate: (g, t, extra) => genArithmetic("multiplication", g, t, extra.allowNegatives),
    },
    {
      id: "division",
      label: "Division",
      group: "rechnen",
      fromGrade: 2,
      fromTerm: 1,
      usesNegatives: true,
      example: () => "z. B. 20 : 5",
      generate: (g, t, extra) => genArithmetic("division", g, t, extra.allowNegatives),
    },
    {
      id: "order_ops",
      label: "Punkt vor Strich",
      group: "rechnen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g, t) => {
        const b = mentalBand(g, t);
        return `z. B. ${b.min + 2} + ${b.min + 3} × ${b.min + 1}`;
      },
      generate: (g, t) => {
        const a = mentalNum(g, t);
        const b = mentalNum(g, t, 2, Math.min(12, mentalBand(g, t).max));
        const product = a * b;
        const kind = randomInt(0, 3);
        if (kind === 0) {
          const c = mentalNum(g, t);
          return numberTask("order_ops", `${a} + ${b} × ${c} =`, a + b * c, { key: `${a}+${b}×${c}` });
        }
        if (kind === 1) {
          const c = mentalNum(g, t);
          return numberTask("order_ops", `${a} × ${b} + ${c} =`, a * b + c, { key: `${a}×${b}+${c}` });
        }
        if (kind === 2) {
          const c = randomInt(mentalBand(g, t).min, Math.max(mentalBand(g, t).min, product - 1));
          return numberTask("order_ops", `${a} × ${b} − ${c} =`, product - c, { key: `${a}×${b}−${c}` });
        }
        const c = mentalNum(g, t, 2, Math.min(9, mentalBand(g, t).max));
        const extra = mentalNum(g, t);
        const left = b * c + extra;
        return numberTask("order_ops", `${left} − ${b} × ${c} =`, extra, { key: `${left}−${b}×${c}` });
      },
    },
    {
      id: "brackets",
      label: "Klammern",
      group: "rechnen",
      fromGrade: 5,
      fromTerm: 1,
      example: (g, t) => {
        const b = mentalBand(g, t);
        return `z. B. (${b.min + 4} + ${b.min + 2}) × ${b.min + 3}`;
      },
      generate: (g, t) => {
        const a = mentalNum(g, t);
        const b = mentalNum(g, t);
        const c = mentalNum(g, t, 2, 16);
        const style = randomInt(0, 3);
        if (style === 0) {
          return numberTask("brackets", `(${a} + ${b}) × ${c} =`, (a + b) * c);
        }
        if (style === 1) {
          const left = Math.max(a, b) + randomInt(1, 6);
          return numberTask("brackets", `(${left} − ${b}) × ${c} =`, (left - b) * c);
        }
        if (style === 2) {
          const k = randomInt(3, 10);
          const sum = c * k;
          const left = randomInt(1, sum - 1);
          return numberTask("brackets", `(${left} + ${sum - left}) : ${c} =`, k);
        }
        const sub = Math.min(a - 1, Math.max(1, b));
        return numberTask("brackets", `${c} × (${a} − ${sub}) =`, c * (a - sub));
      },
    },
    {
      id: "laws",
      label: "Rechengesetze",
      group: "rechnen",
      fromGrade: 4,
      fromTerm: 1,
      untilGrade: 5,
      example: (g, t) => {
        const b = mentalBand(g, t);
        return `z. B. ${b.min + 4} + ${b.min + 2} = ${b.min + 2} + ___`;
      },
      generate: (g, t) => {
        const a = mentalNum(g, t);
        const b = mentalNum(g, t);
        const c = mentalNum(g, t, 2, 12);
        const style = randomInt(0, 2);
        if (style === 0) {
          return numberTask("laws", `${a} + ${b} = ${b} + ___`, a);
        }
        if (style === 1) {
          return numberTask("laws", `${a} × ${c} = ${c} × ___`, a);
        }
        return numberTask("laws", `${c} × (${a} + ${b}) = ${c} × ${a} + ${c} × ___`, b);
      },
    },
    {
      id: "placeholder",
      label: "Platzhalter",
      group: "rechnen",
      fromGrade: 5,
      fromTerm: 1,
      untilGrade: 5,
      example: (g, t) => {
        const b = mentalBand(g, t);
        return `z. B. ___ + ${b.min + 5} = ${b.min * 2 + 12}`;
      },
      generate: (g, t) => {
        const a = mentalNum(g, t);
        const x = mentalNum(g, t);
        const b = a + x;
        const style = randomInt(0, 3);
        if (style === 0) {
          return numberTask("placeholder", `___ + ${a} = ${b}`, x);
        }
        if (style === 1) {
          return numberTask("placeholder", `${b} − ___ = ${a}`, x);
        }
        if (style === 2) {
          const n = mentalNum(g, t, 3, 12);
          const q = mentalNum(g, t, 4, 16);
          return numberTask("placeholder", `___ × ${n} = ${n * q}`, q);
        }
        const n = mentalNum(g, t, 3, 12);
        const q = mentalNum(g, t, 4, 16);
        return numberTask("placeholder", `___ : ${n} = ${q}`, n * q);
      },
    },
    {
      id: "equations",
      label: "Gleichungen",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. 2 · x + 5 = 17" : "z. B. x + 7 = 20"),
      generate: (g, t) => {
        const label = { answerLabel: "x =" };
        if (t === 2) {
          const n = randomInt(3, 9);
          const x = randomInt(8, 24);
          if (Math.random() < 0.5) {
            const b = randomInt(6, 28);
            return numberTask("equations", `${n} · x + ${b} = ${n * x + b}`, x, label);
          }
          const b = randomInt(2, Math.min(28, n * x - 1));
          return numberTask("equations", `${n} · x − ${b} = ${n * x - b}`, x, label);
        }
        const style = randomInt(0, 2);
        if (style === 0) {
          const a = mentalNum(g, t);
          const x = mentalNum(g, t);
          return numberTask("equations", `x + ${a} = ${x + a}`, x, label);
        }
        if (style === 1) {
          const n = randomInt(3, 12);
          const x = randomInt(6, 18);
          return numberTask("equations", `${n} · x = ${n * x}`, x, label);
        }
        const a = mentalNum(g, t);
        const x = a + mentalNum(g, t);
        return numberTask("equations", `x − ${a} = ${x - a}`, x, label);
      },
    },
    {
      id: "fractions_share",
      label: "Anteile",
      group: "rechnen",
      fromGrade: 4,
      fromTerm: 1,
      untilGrade: 5,
      example: (g) => (g >= 5 ? "z. B. 1/3 von 36" : "z. B. 1/2 von 12"),
      generate: (g, t) => {
        const dens = g >= 5 ? [2, 3, 4, 5, 8, 10] : [2, 4, 5, 10];
        const d = pick(dens);
        const factor = g >= 5 ? (t === 2 ? randomInt(8, 24) : randomInt(6, 16)) : randomInt(4, 12);
        const whole = d * factor;
        return numberTask("fractions_share", `1/${d} von ${whole} =`, whole / d);
      },
    },
    {
      id: "fractions_read",
      label: "Brüche erkennen",
      group: "rechnen",
      fromGrade: 5,
      fromTerm: 1,
      untilGrade: 5,
      example: () => "z. B. 1 von 4 Teilen = 1/4",
      generate: (g, t) => {
        const dens = t === 2 ? [3, 4, 5, 6, 8] : [2, 3, 4, 5];
        const d = pick(dens);
        const n = randomInt(1, d - 1);
        const w = 120;
        const slice = w / d;
        let bars = "";
        for (let i = 0; i < d; i += 1) {
          bars += `<rect x="${10 + i * slice}" y="20" width="${slice - 2}" height="40" fill="${i < n ? "#7eb8a4" : "#fff"}" stroke="#1c2430"/>`;
        }
        const label = `${n}/${d}`;
        const options = new Set([label, `1/${d}`, `${Math.min(d - 1, n + 1)}/${d}`, `${n}/${d + 1}`]);
        return choiceTask(
          "fractions_read",
          "Welcher Bruch ist ausgemalt?",
          label,
          [...options],
          { visualHtml: svg(bars, 140, 80), key: label + d }
        );
      },
    },
    {
      id: "fractions",
      label: "Brüche rechnen",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. 2/3 × 3/4" : "z. B. 1/4 + 2/4"),
      generate: (g, t) => {
        function fracTask(prompt, n, d) {
          const gg = gcd(n, d);
          return numberTask("fractions", prompt, { n: n / gg, d: d / gg }, {
            kind: "fraction",
            wide: true,
            key: prompt,
          });
        }

        if (t !== 2) {
          const style = randomInt(0, 2);
          if (style === 0) {
            const d = pick([4, 6, 8, 10]);
            const a = randomInt(1, d - 1);
            const b = randomInt(1, d - a);
            return fracTask(`${a}/${d} + ${b}/${d} =`, a + b, d);
          }
          if (style === 1) {
            const d = pick([4, 6, 8, 10]);
            const a = randomInt(2, d - 1);
            const b = randomInt(1, a - 1);
            return fracTask(`${a}/${d} − ${b}/${d} =`, a - b, d);
          }
          const d = pick([2, 4, 5]);
          const n = randomInt(1, d - 1);
          const whole = d * randomInt(4, 10);
          return numberTask("fractions", `${n}/${d} von ${whole} =`, (whole * n) / d, { kind: "number" });
        }

        const style = randomInt(0, 4);
        if (style <= 1) {
          const [d1, d2] = pick([[2, 4], [2, 6], [3, 6], [3, 9], [4, 8], [4, 12], [5, 10]]);
          const a = randomInt(1, d1 - 1);
          const b = randomInt(1, d2 - 1);
          const left = a * d2;
          const right = b * d1;
          const d = d1 * d2;
          if (style === 0) {
            return fracTask(`${a}/${d1} + ${b}/${d2} =`, left + right, d);
          }
          if (left > right) {
            return fracTask(`${a}/${d1} − ${b}/${d2} =`, left - right, d);
          }
          return fracTask(`${b}/${d2} − ${a}/${d1} =`, right - left, d);
        }
        if (style === 2) {
          const a = randomInt(1, 4);
          const b = pick([2, 3, 4, 5, 6]);
          const c = randomInt(1, 4);
          const d = pick([2, 3, 4, 5, 6].filter((item) => item !== b));
          return fracTask(`${a}/${b} × ${c}/${d} =`, a * c, b * d);
        }
        if (style === 3) {
          const d = pick([2, 3, 4, 5, 8]);
          const n = randomInt(1, d - 1);
          const whole = d * randomInt(6, 16);
          return numberTask("fractions", `${n}/${d} von ${whole} =`, (whole * n) / d, { kind: "number" });
        }
        const a = randomInt(1, 5);
        const b = pick([2, 3, 4, 6, 8]);
        if (Math.random() < 0.5) {
          const div = pick([2, 3, 4].filter((item) => item !== b));
          return fracTask(`${a}/${b} : ${div} =`, a, b * div);
        }
        const c = randomInt(1, 4);
        const d = pick([2, 3, 4, 6].filter((item) => item !== b));
        return fracTask(`${a}/${b} : ${c}/${d} =`, a * d, b * c);
      },
    },
    {
      id: "decimals",
      label: "Dezimalzahlen",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. 3,5 × 4" : "z. B. 1,5 + 2,3"),
      generate: (g, t) => {
        if (t === 2) {
          const style = randomInt(0, 3);
          if (style === 2) {
            const n = pick([2, 3, 4, 5, 10]);
            const a = randomInt(15, 85) / 10;
            return numberTask("decimals", `${fmt(a)} × ${n} =`, Math.round(a * n * 1000) / 1000, { kind: "decimal", wide: true });
          }
          if (style === 3) {
            const n = pick([2, 4, 5, 10]);
            const q = randomInt(12, 80) / 10;
            const a = Math.round(q * n * 10) / 10;
            return numberTask("decimals", `${fmt(a)} : ${n} =`, q, { kind: "decimal", wide: true });
          }
          const a = randomInt(185, 2890) / 100;
          const b = randomInt(125, 1850) / 100;
          if (style === 0) {
            return numberTask("decimals", `${fmt(a)} + ${fmt(b)} =`, Math.round((a + b) * 1000) / 1000, { kind: "decimal", wide: true });
          }
          const left = Math.max(a, b);
          const right = Math.min(a, b);
          return numberTask("decimals", `${fmt(left)} − ${fmt(right)} =`, Math.round((left - right) * 1000) / 1000, { kind: "decimal", wide: true });
        }
        const a = randomInt(15, 95) / 10;
        const b = randomInt(12, 80) / 10;
        const add = Math.random() < 0.5;
        const left = add ? a : Math.max(a, b);
        const right = add ? b : Math.min(a, b);
        const answer = add ? Math.round((left + right) * 1000) / 1000 : Math.round((left - right) * 1000) / 1000;
        return numberTask("decimals", `${fmt(left)} ${add ? "+" : "−"} ${fmt(right)} =`, answer, { kind: "decimal", wide: true });
      },
    },
    {
      id: "percent",
      label: "Prozent",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. 20 % von 180" : "z. B. 10 % von 50"),
      generate: (g, t) => {
        const p = t === 2 ? pick([5, 10, 20, 25, 50]) : pick([10, 25, 50, 100]);
        const bases = t === 2
          ? { 5: [80, 120, 200, 400, 600], 10: [80, 150, 200, 250, 400], 20: [80, 120, 150, 200, 250], 25: [80, 120, 160, 240], 50: [80, 120, 200, 400] }
          : { 10: [20, 40, 50, 80, 100, 200], 25: [20, 40, 80, 120], 50: [20, 40, 50, 80, 100, 200], 100: [20, 40, 50, 80] };
        const base = pick(bases[p]);
        const part = (base * p) / 100;
        if (t === 2 && Math.random() < 0.4) {
          return numberTask("percent", `${part} von ${base} sind ___ %`, p);
        }
        return numberTask("percent", `${p} % von ${base} =`, part);
      },
    },
    {
      id: "proportion",
      label: "Dreisatz",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. 6 Hefte = 48 €, 15 Hefte = ?" : "z. B. 3 Hefte = 12 €, 5 Hefte = ?"),
      generate: (g, t) => {
        const n1 = t === 2 ? pick([4, 5, 6, 8]) : pick([2, 3, 4, 5]);
        const unit = t === 2 ? randomInt(6, 18) : randomInt(2, 8);
        const price = n1 * unit;
        const n2pool = t === 2 ? [2, 3, 9, 12, 15, 16, 18] : [2, 6, 8, 9, 10];
        const n2 = pick(n2pool.filter((n) => n !== n1));
        const answer = (price / n1) * n2;
        const thing = pick(["Hefte", "Brötchen", "Sticker"]);
        return numberTask(
          "proportion",
          `${n1} ${thing} kosten ${price} €. Was kosten ${n2} ${thing}?`,
          answer
        );
      },
    },
    {
      id: "mean",
      label: "Mittelwert",
      group: "rechnen",
      fromGrade: 6,
      fromTerm: 1,
      example: (g, t) => (t === 2 ? "z. B. Mittelwert von 18, 24, 30, 36" : "z. B. Mittelwert von 4, 6, 8"),
      generate: (g, t) => {
        const count = t === 2 ? pick([4, 5]) : pick([3, 4]);
        const mean = t === 2 ? randomInt(18, 60) : randomInt(6, 16);
        const spread = t === 2 ? 6 : 2;
        const values = count === 3
          ? shuffle([mean - spread, mean, mean + spread])
          : count === 5
            ? shuffle([mean - spread * 2, mean - spread, mean, mean + spread, mean + spread * 2])
            : shuffle([mean - spread - 1, mean - 1, mean + 1, mean + spread + 1]);
        return numberTask("mean", `Mittelwert von ${values.join(", ")} =`, mean);
      },
    },
    {
      id: "word",
      label: "Sachaufgaben",
      group: "rechnen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g, t) => (g >= 5 ? "z. B. 120 Sticker, 35 weg, 18 dazu" : "z. B. 12 Äpfel, 4 weg, 7 dazu"),
      generate: (g, t) => {
        const name = pick(["Lea", "Ben", "Mia", "Omar", "Nora"]);
        const thing = pick(["Äpfel", "Sticker", "Murmeln", "Karten"]);
        const a = g >= 6
          ? (t === 2 ? randomInt(140, 480) : randomInt(80, 240))
          : g >= 5
            ? (t === 2 ? randomInt(80, 220) : randomInt(40, 140))
            : g >= 4
              ? (t === 2 ? randomInt(50, 180) : randomInt(25, 90))
              : (t === 2 ? randomInt(20, 80) : randomInt(10, 36));
        const b = g >= 6
          ? (t === 2 ? randomInt(20, 90) : randomInt(12, 40))
          : g >= 5
            ? (t === 2 ? randomInt(12, 50) : randomInt(8, 30))
            : g >= 4
              ? (t === 2 ? randomInt(8, 35) : randomInt(5, 20))
              : (t === 2 ? randomInt(4, 18) : randomInt(2, 8));
        const c = g >= 6
          ? (t === 2 ? randomInt(15, 70) : randomInt(8, 35))
          : g >= 4
            ? (t === 2 ? randomInt(8, 40) : randomInt(4, 20))
            : (t === 2 ? randomInt(3, 16) : randomInt(2, 8));
        const give = Math.min(b, a - 1);
        const style = randomInt(0, g >= 4 ? 3 : 1);
        if (style === 0) {
          return numberTask(
            "word",
            `${name} hat ${a} ${thing}. ${name} verschenkt ${give} und bekommt ${c} dazu. Wie viele ${thing} sind es jetzt?`,
            a - give + c
          );
        }
        if (style === 1) {
          return numberTask(
            "word",
            `${name} kauft ${a} ${thing} für je ${b} Cent. Was kostet das zusammen (in Cent)?`,
            a * b
          );
        }
        if (style === 2) {
          const groups = pick(g >= 6 ? [4, 5, 6, 8, 10] : [3, 4, 5, 6]);
          const each = randomInt(g >= 6 ? 8 : 4, g >= 6 ? 24 : 12);
          const total = groups * each;
          return numberTask(
            "word",
            `${name} verteilt ${total} ${thing} gleichmäßig auf ${groups} Kinder. Wie viele ${thing} bekommt jedes Kind?`,
            each
          );
        }
        const other = pick(["Lea", "Ben", "Mia", "Omar", "Nora"].filter((item) => item !== name));
        const more = Math.max(a, b + give);
        const less = Math.min(a, Math.max(1, more - give));
        return numberTask(
          "word",
          `${name} hat ${more} ${thing}, ${other} hat ${less}. Wie viele ${thing} hat ${name} mehr?`,
          more - less
        );
      },
    },
    {
      id: "decompose",
      label: "Zerlegen",
      group: "zahlen",
      fromGrade: 1,
      fromTerm: 1,
      untilGrade: 2,
      example: (g, t) => `z. B. ${Math.min(10, addMax(g, t))} = 3 + ___`,
      generate: (g, t) => {
        const max = Math.min(addMax(g, t), g >= 2 ? addMax(g, t) : addMax(g, t));
        const total = niceNumber(max, Math.max(g === 1 ? 4 : 8, addMinOf(g, t)));
        const part = randomInt(1, total - 1);
        return numberTask("decompose", `${total} = ${part} + ___`, total - part);
      },
    },
    {
      id: "compare",
      label: "Größer / kleiner",
      group: "zahlen",
      fromGrade: 1,
      fromTerm: 1,
      usesNegatives: true,
      example: (g, t) => {
        const pair = samplePair(g, t);
        return `z. B. ${fmt(pair.a)} > ${fmt(pair.b)}`;
      },
      generate: (g, t, extra) => {
        const max = extra.allowNegatives ? (levelOf(g, t).neg?.addMax ?? 40) : addMax(g, t);
        const min = extra.allowNegatives ? -(levelOf(g, t).neg?.addMax ?? 40) : addMinOf(g, t);
        let a = randomInt(min, max);
        let b = randomInt(min, max);
        if (!extra.allowNegatives && g >= 3 && Math.random() < 0.35) {
          const step = g >= 5 ? pick([1, 2, 10, 100]) : pick([1, 2, 10]);
          b = Math.max(min, Math.min(max, a + (Math.random() < 0.5 ? -step : step)));
        }
        if (Math.random() < 0.15) {
          b = a;
        }
        const sign = a > b ? ">" : a < b ? "<" : "=";
        return choiceTask("compare", `${fmt(a)}  ___  ${fmt(b)}`, sign, ["<", "=", ">"], {
          key: `${a}:${b}`,
          shuffle: false,
        });
      },
    },
    {
      id: "neighbor",
      label: "Vorgänger / Nachfolger",
      group: "zahlen",
      fromGrade: 1,
      fromTerm: 1,
      untilGrade: 3,
      example: (g, t) => `z. B. Nachfolger von ${Math.min(8, addMax(g, t))}`,
      generate: (g, t) => {
        const n = gradeNum(g, t, g === 1 ? 1 : addMinOf(g, t));
        if (Math.random() < 0.5) {
          return numberTask("neighbor", `Nachfolger von ${fmt(n)} =`, n + 1);
        }
        return numberTask("neighbor", `Vorgänger von ${fmt(n + 1)} =`, n);
      },
    },
    {
      id: "double_half",
      label: "Verdoppeln / Halbieren",
      group: "zahlen",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. das Doppelte von 6",
      generate: (g, t) => {
        const max = g >= 4 ? (t === 2 ? 250 : 120) : g >= 3 ? (t === 2 ? 80 : 40) : Math.min(t === 2 ? 40 : 25, Math.floor(addMax(g, t) / 2));
        const n = niceNumber(max, g >= 3 ? 12 : 4);
        if (Math.random() < 0.5) {
          return numberTask("double_half", `Das Doppelte von ${n} =`, n * 2);
        }
        return numberTask("double_half", `Die Hälfte von ${n * 2} =`, n);
      },
    },
    {
      id: "even_odd",
      label: "Gerade / ungerade",
      group: "zahlen",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 3,
      example: () => "z. B. 14 ist eine gerade Zahl",
      generate: (g, t) => {
        const n = gradeNum(g, t, 1);
        const answer = n % 2 === 0 ? "gerade Zahl" : "ungerade Zahl";
        return choiceTask(
          "even_odd",
          `Ist ${fmt(n)} eine gerade oder eine ungerade Zahl?`,
          answer,
          ["gerade Zahl", "ungerade Zahl"],
          { shuffle: false }
        );
      },
    },
    {
      id: "round",
      label: "Runden",
      group: "zahlen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g, t) => (g >= 5 ? "z. B. 4827 auf Tausender → 5000" : "z. B. 47 auf Zehner → 50"),
      generate: (g, t) => {
        const step = g >= 6
          ? (t === 2 ? pick([100, 1000, 10000]) : pick([100, 1000]))
          : g >= 5
            ? pick([10, 100, 1000])
            : g >= 4
              ? (t === 2 ? pick([10, 100, 1000]) : pick([10, 100]))
              : (t === 2 ? pick([10, 100]) : 10);
        const minN = Math.max(addMinOf(g, t), step + 1);
        const maxN = Math.min(addMax(g, t), step * (g >= 5 ? 400 : 60));
        let n = randomInt(minN, Math.max(minN + step, maxN));
        if (n % step === 0) {
          n += randomInt(1, step - 1);
        }
        const label = step === 10 ? "Zehner" : step === 100 ? "Hunderter" : step === 1000 ? "Tausender" : "Zehntausender";
        return numberTask("round", `Runde ${fmt(n)} auf ${label}.`, roundTo(n, step));
      },
    },
    {
      id: "estimate",
      label: "Überschlagen",
      group: "zahlen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g, t) => (g >= 6 ? "z. B. 4820 + 3190 → 5000 + 3000" : g >= 5 ? "z. B. 482 + 319 → 500 + 300" : "z. B. 48 + 31 → 50 + 30"),
      generate: (g, t) => {
        const step = g >= 6 ? (t === 2 ? 1000 : 100) : g >= 5 ? 100 : g >= 4 && t === 2 ? 100 : 10;
        const min = g >= 6
          ? (t === 2 ? 2500 : 450)
          : g >= 5
            ? (t === 2 ? 450 : 120)
            : g >= 4
              ? (t === 2 ? 120 : 40)
              : 21;
        const max = g >= 6
          ? (t === 2 ? 28000 : 8900)
          : g >= 5
            ? (t === 2 ? 4500 : 890)
            : g >= 4
              ? (t === 2 ? 890 : 280)
              : 89;
        const a = randomInt(min, max);
        const b = randomInt(min, max);
        const subtract = Math.random() < 0.4;
        const left = subtract ? Math.max(a, b) : a;
        const right = subtract ? Math.min(a, b) : b;
        const answer = subtract ? roundTo(left, step) - roundTo(right, step) : roundTo(left, step) + roundTo(right, step);
        const label = step === 1000 ? "Tausender" : step === 100 ? "Hunderter" : "Zehner";
        return numberTask("estimate", `Überschlage ${fmt(left)} ${subtract ? "−" : "+"} ${fmt(right)} (erst auf ${label} runden).`, answer);
      },
    },
    {
      id: "divisible",
      label: "Teilbarkeit",
      group: "zahlen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g) => (g >= 5 ? "z. B. 81 durch 9?" : "z. B. 45 durch 5?"),
      generate: (g, t) => {
        const d = g >= 5 ? pick([2, 3, 4, 5, 9, 10]) : pick([2, 5, 10]);
        const yes = Math.random() < 0.5;
        const mulMin = g >= 6 ? 12 : g >= 5 ? 8 : g >= 4 ? 5 : 3;
        const mulMax = g >= 6 ? (t === 2 ? 90 : 50) : g >= 5 ? 40 : g >= 4 ? 25 : 15;
        const n = yes ? d * randomInt(mulMin, mulMax) : d * randomInt(mulMin, mulMax) + pick([1, 3, 7]);
        return choiceTask(
          "divisible",
          `Ist ${n} durch ${d} teilbar?`,
          n % d === 0 ? "Ja" : "Nein",
          ["Ja", "Nein"],
          { shuffle: false }
        );
      },
    },
    {
      id: "roman",
      label: "Römische Zahlen",
      group: "zahlen",
      fromGrade: 3,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. 14 = XIV",
      generate: (g, t) => {
        const n = randomInt(g >= 4 ? (t === 2 ? 16 : 8) : (t === 2 ? 8 : 4), g >= 4 ? (t === 2 ? 89 : 40) : (t === 2 ? 30 : 20));
        if (Math.random() < 0.5) {
          return numberTask("roman", `${toRoman(n)} =`, n);
        }
        return numberTask("roman", `${n} als römische Zahl =`, toRoman(n), { kind: "text", wide: true });
      },
    },
    {
      id: "primes",
      label: "Primzahlen",
      group: "zahlen",
      fromGrade: 5,
      fromTerm: 1,
      example: () => "z. B. 7 ist eine Primzahl",
      generate: (g, t) => {
        const prime = g >= 6
          ? pick(t === 2 ? [29, 31, 37, 41, 43, 47, 53, 59] : [11, 13, 17, 19, 23, 29, 31, 37, 41, 43])
          : pick(t === 2 ? [11, 13, 17, 19, 23, 29, 31] : [2, 3, 5, 7, 11, 13, 17, 19, 23]);
        const others = g >= 6
          ? shuffle([21, 25, 27, 32, 33, 34, 35, 36, 39, 42, 44, 45, 49, 51, 55]).slice(0, 3)
          : shuffle([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27]).slice(0, 3);
        return choiceTask("primes", "Welche Zahl ist eine Primzahl?", String(prime), [prime, ...others].map(String), {
          key: String(prime),
        });
      },
    },
    {
      id: "table_read",
      label: "Tabellen",
      group: "zahlen",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. Werte aus einer Tabelle ablesen",
      generate: (g, t) => {
        const hi = g >= 4 ? (t === 2 ? 80 : 40) : g >= 3 ? (t === 2 ? 36 : 20) : (t === 2 ? 16 : 10);
        const lo = g >= 3 ? 8 : 2;
        const a = randomInt(lo, hi);
        const b = randomInt(lo, hi);
        const c = randomInt(lo, Math.max(lo, Math.round(hi * 0.7)));
        const promptHtml = `
          <table class="mini-table">
            <tr><th>Kind</th><th>Punkte</th></tr>
            <tr><td>Anna</td><td>${a}</td></tr>
            <tr><td>Ben</td><td>${b}</td></tr>
            <tr><td>Cara</td><td>${c}</td></tr>
          </table>
          <div>Wie viele Punkte haben alle zusammen?</div>`;
        return numberTask("table_read", "Punkte zusammen", a + b + c, { promptHtml, key: `${a}:${b}:${c}` });
      },
    },
    {
      id: "money",
      label: "Geld",
      group: "groessen",
      fromGrade: 2,
      fromTerm: 1,
      example: (g) => (g >= 4 ? "z. B. 1,20 € + 0,50 €" : g >= 3 ? "z. B. 80 ct + 50 ct" : "z. B. 20 ct + 50 ct"),
      generate: (g, t) => {
        const euro = (cents) => `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")} €`;
        const minus = g >= 3 && Math.random() < 0.45;

        if (g < 3) {
          const coins = t === 2 ? [10, 20, 50] : [5, 10, 20, 50];
          const a = pick(coins);
          const b = pick(coins);
          return numberTask("money", `${a} ct + ${b} ct = ___ ct`, a + b);
        }

        if (g === 3) {
          const a = t === 2 ? randomInt(35, 180) : pick([10, 20, 50, 80, 100]);
          const b = t === 2 ? randomInt(20, 120) : pick([10, 20, 50, 80]);
          if (minus && Math.max(a, b) > Math.min(a, b)) {
            const left = Math.max(a, b);
            const right = Math.min(a, b);
            if (t === 1) {
              return numberTask("money", `${left} ct − ${right} ct = ___ ct`, left - right);
            }
            return numberTask("money", `${euro(left)} − ${euro(right)} = ___ €`, (left - right) / 100, { kind: "decimal", wide: true });
          }
          if (t === 1) {
            return numberTask("money", `${a} ct + ${b} ct = ___ ct`, a + b);
          }
          return numberTask("money", `${euro(a)} + ${euro(b)} = ___ €`, (a + b) / 100, { kind: "decimal", wide: true });
        }

        const a = g >= 6
          ? (t === 2 ? randomInt(280, 1450) : randomInt(180, 980))
          : g >= 5
            ? (t === 2 ? randomInt(150, 890) : randomInt(85, 650))
            : (t === 2 ? randomInt(80, 520) : randomInt(40, 350));
        const b = g >= 6
          ? (t === 2 ? randomInt(150, 980) : randomInt(95, 780))
          : g >= 5
            ? (t === 2 ? randomInt(70, 560) : randomInt(40, 420))
            : (t === 2 ? randomInt(35, 380) : randomInt(20, 250));
        if (minus && a !== b) {
          const left = Math.max(a, b);
          const right = Math.min(a, b);
          return numberTask("money", `${euro(left)} − ${euro(right)} = ___ €`, (left - right) / 100, { kind: "decimal", wide: true });
        }
        return numberTask("money", `${euro(a)} + ${euro(b)} = ___ €`, (a + b) / 100, { kind: "decimal", wide: true });
      },
    },
    {
      id: "clock",
      label: "Uhr",
      group: "groessen",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 3,
      example: (g) => (g >= 3 ? "z. B. 8:25" : "z. B. 8:30"),
      generate: (g, t) => {
        const hours = randomInt(1, 12);
        const minutes = g >= 3
          ? pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
          : t === 2
            ? pick([0, 15, 30, 45])
            : pick([0, 30]);
        const stamp = `${hours}:${String(minutes).padStart(2, "0")}`;
        return numberTask("clock", "Wie spät ist es? Schreibe z. B. 8:30", stamp, {
          kind: "text",
          wide: true,
          visualHtml: clockSvg(hours, minutes),
          key: stamp,
        });
      },
    },
    {
      id: "length",
      label: "Längen cm / m",
      group: "groessen",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 2,
      example: () => "z. B. 2 m = 200 cm",
      generate: (g, t) => {
        const m = randomInt(t === 2 ? 3 : 1, t === 2 ? 12 : 8);
        if (Math.random() < 0.5) {
          return numberTask("length", `${m} m = ___ cm`, m * 100);
        }
        return numberTask("length", `${m * 100} cm = ___ m`, m);
      },
    },
    {
      id: "length_convert",
      label: "Längen umrechnen",
      group: "groessen",
      fromGrade: 3,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. 130 cm = 1,3 m",
      generate: (g, t) => {
        if (g >= 4 && Math.random() < 0.5) {
          const cm = t === 2 ? pick([150, 250, 175, 325, 80, 405]) : pick([150, 250, 120, 175, 80]);
          return numberTask("length_convert", `${cm} cm = ___ m`, cm / 100, { kind: "decimal", wide: true });
        }
        const m = randomInt(g >= 4 ? 4 : 2, g >= 4 ? (t === 2 ? 25 : 15) : (t === 2 ? 18 : 12));
        return numberTask("length_convert", `${m} m = ___ mm`, m * 1000);
      },
    },
    {
      id: "weight",
      label: "Gewicht",
      group: "groessen",
      fromGrade: 3,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. 2 kg = 2000 g",
      generate: (g, t) => {
        const kg = randomInt(g >= 4 ? 3 : 1, g >= 4 ? (t === 2 ? 18 : 12) : (t === 2 ? 10 : 6));
        if (Math.random() < 0.5) {
          return numberTask("weight", `${kg} kg = ___ g`, kg * 1000);
        }
        return numberTask("weight", `${kg * 1000} g = ___ kg`, kg);
      },
    },
    {
      id: "time_units",
      label: "Zeit / Kalender",
      group: "groessen",
      fromGrade: 3,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. 2 Stunden = 120 Minuten",
      generate: (g, t) => {
        const style = randomInt(0, 2);
        if (style === 0) {
          const h = randomInt(g >= 4 ? 4 : 2, g >= 4 ? (t === 2 ? 18 : 12) : (t === 2 ? 8 : 6));
          return numberTask("time_units", `${h} Stunden = ___ Minuten`, h * 60);
        }
        if (style === 1) {
          const w = randomInt(g >= 4 ? 3 : 2, g >= 4 ? (t === 2 ? 14 : 8) : 6);
          return numberTask("time_units", `${w} Wochen = ___ Tage`, w * 7);
        }
        const days = randomInt(2, g >= 4 ? 6 : 4);
        return numberTask("time_units", `${days} Tage = ___ Stunden`, days * 24);
      },
    },
    {
      id: "perimeter_area",
      label: "Umfang / Fläche",
      group: "groessen",
      fromGrade: 3,
      fromTerm: 1,
      example: (g, t) => (g >= 6 && t === 2 ? "z. B. Rechteck 18 cm × 12 cm" : "z. B. Rechteck 5 cm × 3 cm"),
      generate: (g, t) => {
        const hard = g >= 6 && t === 2;
        const aMin = hard ? 12 : g >= 6 ? 8 : g >= 5 ? (t === 2 ? 8 : 6) : g >= 4 ? (t === 2 ? 6 : 4) : 3;
        const aMax = hard ? 36 : g >= 6 ? 24 : g >= 5 ? (t === 2 ? 22 : 16) : g >= 4 ? (t === 2 ? 16 : 12) : (t === 2 ? 10 : 8);
        const bMin = hard ? 8 : g >= 6 ? 6 : g >= 5 ? (t === 2 ? 6 : 4) : g >= 4 ? 3 : 2;
        const bMax = hard ? 28 : g >= 6 ? 16 : g >= 5 ? (t === 2 ? 14 : 10) : g >= 4 ? 10 : 8;

        function rectVisual(widthCm, heightCm) {
          return svg(
            `<rect x="40" y="32" width="90" height="52" fill="#e7f0ec" stroke="#1c2430" stroke-width="2"/>
             <text x="85" y="22" text-anchor="middle" font-size="14">${widthCm} cm</text>
             <text x="138" y="62" font-size="14">${heightCm} cm</text>`,
            210,
            108
          );
        }

        if (hard && Math.random() < 0.35) {
          let base = randomInt(12, 28);
          let height = randomInt(8, 20);
          if ((base * height) % 2 !== 0) {
            height += 1;
          }
          const visual = svg(
            `<polygon points="36,96 176,96 106,28" fill="#e7f0ec" stroke="#1c2430" stroke-width="2"/>
             <line x1="106" y1="28" x2="106" y2="96" stroke="#c45c26" stroke-width="1.5" stroke-dasharray="4 3"/>
             <text x="106" y="116" text-anchor="middle" font-size="14">${base} cm</text>
             <text x="122" y="68" font-size="14">${height} cm</text>`,
            240,
            140
          );
          return numberTask("perimeter_area", `Fläche des Dreiecks in cm² =`, (base * height) / 2, { visualHtml: visual });
        }

        const a = randomInt(aMin, aMax);
        const b = randomInt(bMin, Math.max(bMin, Math.min(a, bMax)));
        const visual = rectVisual(a, b);
        if (g === 3 || Math.random() < (hard ? 0.3 : 0.5)) {
          return numberTask("perimeter_area", `Umfang des Rechtecks in cm =`, 2 * (a + b), { visualHtml: visual });
        }
        return numberTask("perimeter_area", `Fläche des Rechtecks in cm² =`, a * b, { visualHtml: visual });
      },
    },
    {
      id: "scale",
      label: "Maßstab",
      group: "groessen",
      fromGrade: 4,
      fromTerm: 1,
      example: (g) => (g >= 6 ? "z. B. 1 : 250, 4 cm → 10 m" : "z. B. 1 : 100, 3 cm → 3 m"),
      generate: (g, t) => {
        const scale = g >= 6
          ? (t === 2 ? pick([100, 200, 250, 500, 1000]) : pick([50, 100, 200, 250, 500]))
          : g >= 5
            ? pick([50, 100, 200, 250])
            : pick([50, 100, 200]);
        const cm = g >= 6 ? randomInt(t === 2 ? 5 : 3, t === 2 ? 18 : 12) : randomInt(2, 8);
        const realCm = cm * scale;
        if (g >= 6 && t === 2 && Math.random() < 0.45) {
          return numberTask(
            "scale",
            `Maßstab 1 : ${scale}. ${realCm / 100} m in echt sind ___ cm auf der Karte.`,
            cm
          );
        }
        return numberTask(
          "scale",
          `Maßstab 1 : ${scale}. ${cm} cm auf der Karte sind ___ m in echt.`,
          realCm / 100,
          { kind: realCm % 100 === 0 ? "number" : "decimal" }
        );
      },
    },
    {
      id: "cuboid",
      label: "Würfel / Quader",
      group: "groessen",
      fromGrade: 4,
      fromTerm: 1,
      example: (g) => (g >= 6 ? "z. B. Würfel Kante 12 cm, Volumen 1728" : "z. B. Würfel Kante 5 cm, Volumen 125"),
      generate: (g, t) => {
        const hard = g >= 6 && t === 2;
        if (Math.random() < 0.5) {
          const a = hard ? randomInt(10, 20) : g >= 6 ? randomInt(8, 16) : g >= 5 ? randomInt(t === 2 ? 7 : 5, 12) : randomInt(t === 2 ? 4 : 3, t === 2 ? 10 : 8);
          return numberTask("cuboid", `Würfel, Kante ${a} cm. Volumen in cm³ =`, a * a * a);
        }
        const l = hard ? randomInt(10, 22) : g >= 6 ? randomInt(8, 18) : g >= 5 ? randomInt(t === 2 ? 7 : 5, 12) : randomInt(t === 2 ? 5 : 4, t === 2 ? 12 : 10);
        const w = hard ? randomInt(8, 16) : g >= 6 ? randomInt(6, 12) : g >= 5 ? randomInt(t === 2 ? 5 : 4, 9) : randomInt(3, 7);
        const h = hard ? randomInt(6, 14) : g >= 6 ? randomInt(4, 10) : g >= 5 ? randomInt(t === 2 ? 4 : 3, 8) : randomInt(2, 6);
        return numberTask("cuboid", `Quader ${l} cm × ${w} cm × ${h} cm. Volumen in cm³ =`, l * w * h);
      },
    },
    {
      id: "unit_convert",
      label: "Größen umrechnen",
      group: "groessen",
      fromGrade: 5,
      fromTerm: 1,
      example: (g) => (g >= 6 ? "z. B. 2,5 km = 2500 m" : "z. B. 3 km = 3000 m"),
      generate: (g, t) => {
        if (g >= 6 && (t === 2 || Math.random() < 0.45)) {
          const style = randomInt(0, 2);
          if (style === 0) {
            const km = pick(t === 2 ? [1.5, 2.5, 3.5, 4.5, 6.5] : [1.5, 2.5, 3.5, 4.5]);
            return numberTask("unit_convert", `${fmt(km)} km = ___ m`, km * 1000);
          }
          if (style === 1) {
            const kg = pick(t === 2 ? [1.5, 2.5, 3.5, 4.5] : [1.5, 2.5, 3.5]);
            return numberTask("unit_convert", `${fmt(kg)} kg = ___ g`, kg * 1000);
          }
          const liters = pick(t === 2 ? [0.5, 1.5, 2.5, 3.5] : [0.5, 1.5, 2.5]);
          return numberTask("unit_convert", `${fmt(liters)} l = ___ ml`, liters * 1000);
        }
        const style = randomInt(0, 2);
        if (style === 0) {
          const km = randomInt(g >= 6 ? 4 : 2, g >= 6 ? 18 : t === 2 ? 12 : 9);
          return numberTask("unit_convert", `${km} km = ___ m`, km * 1000);
        }
        if (style === 1) {
          const tons = randomInt(g >= 6 ? 3 : 2, g >= 6 ? 14 : t === 2 ? 9 : 6);
          return numberTask("unit_convert", `${tons} t = ___ kg`, tons * 1000);
        }
        const liters = randomInt(g >= 6 ? 3 : 2, g >= 6 ? 14 : t === 2 ? 10 : 8);
        return numberTask("unit_convert", `${liters} l = ___ ml`, liters * 1000);
      },
    },
    {
      id: "shapes",
      label: "Formen",
      group: "geometrie",
      fromGrade: 1,
      fromTerm: 1,
      untilGrade: 2,
      example: () => "z. B. Kreis, Dreieck, Quadrat",
      generate: () => {
        const kind = pick(["kreis", "dreieck", "quadrat", "rechteck"]);
        return choiceTask("shapes", "Welche Form ist das?", kind, [
          { value: "kreis", label: "Kreis" },
          { value: "dreieck", label: "Dreieck" },
          { value: "quadrat", label: "Quadrat" },
          { value: "rechteck", label: "Rechteck" },
        ], { visualHtml: shapeSvg(kind), key: kind });
      },
    },
    {
      id: "position",
      label: "Lage",
      group: "geometrie",
      fromGrade: 1,
      fromTerm: 1,
      untilGrade: 2,
      example: () => "z. B. links vom Haus",
      generate: () => {
        const places = [
          { id: "links", label: "links vom Haus", at: [22, 52] },
          { id: "rechts", label: "rechts vom Haus", at: [118, 52] },
          { id: "oben", label: "über dem Haus", at: [70, 12] },
          { id: "unten", label: "unter dem Haus", at: [70, 84] },
        ];
        const place = pick(places);
        const [sx, sy] = place.at;
        const points = [];
        for (let i = 0; i < 10; i += 1) {
          const radius = i % 2 === 0 ? 9 : 4;
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;
          points.push(`${sx + radius * Math.cos(angle)},${sy + radius * Math.sin(angle)}`);
        }
        const visual = svg(
          `<rect x="56" y="40" width="28" height="24" fill="#c45c26" stroke="#1c2430" stroke-width="2"/>
           <polygon points="70,26 86,40 54,40" fill="#9d4316" stroke="#1c2430" stroke-width="2"/>
           <polygon points="${points.join(" ")}" fill="#ffd166" stroke="#1c2430" stroke-width="1.5"/>`,
          140,
          100
        );
        return choiceTask(
          "position",
          "Wo ist der Stern?",
          place.label,
          places.map((item) => item.label),
          {
            visualHtml: visual,
            shuffle: false,
            key: place.id,
          }
        );
      },
    },
    {
      id: "pattern",
      label: "Muster",
      group: "geometrie",
      fromGrade: 1,
      fromTerm: 1,
      example: (g, t) => (g >= 3 ? `z. B. ${g >= 6 ? "24, 36, 48, ___" : "2, 4, 6, ___"}` : "z. B. Farbe im Muster"),
      generate: (g, t) => {
        if (g >= 3 || (g === 2 && (t === 2 || Math.random() < 0.45))) {
          const step = g >= 6
            ? pick(t === 2 ? [6, 8, 12, 15, 25] : [4, 5, 6, 8, 10])
            : g >= 5
              ? pick([3, 4, 5, 6, 8, 10])
              : g >= 3
                ? pick(t === 2 ? [2, 3, 4, 5, 10] : [2, 3, 5, 10])
                : pick([2, 5, 10]);
          const start = g >= 6
            ? randomInt(t === 2 ? 24 : 8, t === 2 ? 120 : 40)
            : g >= 4
              ? randomInt(8, 40)
              : randomInt(1, 8);
          const seq = [0, 1, 2, 3].map((i) => start + i * step);
          return numberTask("pattern", `${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ___`, start + 4 * step);
        }
        const colorNames = {
          "#c45c26": "orange",
          "#2f5d50": "grün",
          "#4cc9f0": "blau",
          "#ffd166": "gelb",
        };
        const colors = ["#c45c26", "#2f5d50", "#4cc9f0"];
        const a = pick(colors);
        const b = pick(colors.filter((c) => c !== a));
        const seq = [a, a, b, a, a];
        const next = b;
        let dots = "";
        seq.forEach((color, i) => {
          dots += `<circle cx="${18 + i * 24}" cy="28" r="9" fill="${color}" stroke="#1c2430"/>`;
        });
        dots += `<text x="${18 + 5 * 24}" y="33" text-anchor="middle" font-size="16">?</text>`;
        const options = shuffle([next, a, "#ffd166"]).map((color) => ({
          value: color,
          label: colorNames[color],
          html: svg(`<circle cx="20" cy="20" r="10" fill="${color}" stroke="#1c2430"/>`, 40, 40),
        }));
        return {
          type: "pattern",
          kind: "choice",
          prompt: "Welche Farbe kommt als Nächstes?",
          visualHtml: svg(dots, 160, 56),
          answer: next,
          choices: options.map((item) => ({ value: item.value, label: item.label, html: item.html })),
          key: `pat:${next}:${a}`,
        };
      },
    },
    {
      id: "number_line",
      label: "Zahlenstrahl",
      group: "geometrie",
      fromGrade: 1,
      fromTerm: 1,
      untilGrade: 3,
      example: () => "z. B. 4, 5, ___, 7",
      generate: (g, t) => {
        const step = g >= 3 ? pick([1, 2, 5, 10]) : g >= 2 ? pick([1, 2, 5]) : 1;
        const start = niceNumber(Math.max(0, addMax(g, t) - step * 5), g === 1 ? 0 : Math.max(0, addMinOf(g, t)));
        const seq = [0, 1, 2, 3, 4, 5].map((i) => start + i * step);
        const hide = randomInt(1, 4);
        const marks = seq
          .map((n, i) => `<span class="${i === hide ? "nl-missing" : ""}">${i === hide ? "?" : fmt(n)}</span>`)
          .join("");
        return numberTask("number_line", "Welche Zahl fehlt auf dem Zahlenstrahl?", seq[hide], {
          visualHtml: `<div class="number-line">${marks}</div>`,
          key: seq.join("-") + hide,
        });
      },
    },
    {
      id: "mirror",
      label: "Spiegeln",
      group: "geometrie",
      fromGrade: 2,
      fromTerm: 1,
      untilGrade: 4,
      example: () => "z. B. Spiegelbild wählen",
      generate: (g) => {
        const figures = [
          { id: "l", inner: `<path d="M16 10 h20 v14 h-10 v20 h-10 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "arrow", inner: `<path d="M10 24 h20 v-10 l18 16 -18 16 v-10 h-20 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "step", inner: `<path d="M12 42 h14 v-12 h14 v-16 h-28 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "boot", inner: `<path d="M16 10 h16 v20 h14 v14 h-30 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "tee", inner: `<path d="M12 10 h36 v12 h-12 v26 h-12 v-26 h-12 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "flag", inner: `<path d="M18 8 v40" fill="none" stroke="#1c2430" stroke-width="3"/><path d="M20 10 h22 l-8 10 8 10 h-22 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "hook", inner: `<path d="M34 10 v28 h-18 v-10 h8 v-18 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "chair", inner: `<path d="M16 12 h20 v14 h8 v20 h-10 v-12 h-18 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "eff", inner: `<path d="M16 10 h24 v10 h-14 v8 h12 v10 h-12 v10 h-10 z" fill="#2f5d50" stroke="#1c2430"/>` },
          { id: "zag", inner: `<path d="M14 12 h22 l-14 14 h18 v14 h-24 l14 -14 h-16 z" fill="#2f5d50" stroke="#1c2430"/>` },
        ];
        const pool = g >= 4 ? figures : g >= 3 ? figures.slice(0, 8) : figures.slice(0, 6);
        const fig = pick(pool);
        const faceLeft = Math.random() < 0.5;
        const flip = `<g transform="translate(56,0) scale(-1,1)">${fig.inner}</g>`;
        const shown = faceLeft ? flip : fig.inner;
        const mirrored = faceLeft ? fig.inner : flip;
        const rotated = `<g transform="rotate(180 28 28)">${fig.inner}</g>`;
        const choices = [
          { value: "spiegel", label: "A", html: svg(mirrored, 60, 56) },
          { value: "gleich", label: "B", html: svg(shown, 60, 56) },
          { value: "gedreht", label: "C", html: svg(rotated, 60, 56) },
        ];
        return choiceTask("mirror", "Welches Bild ist das Spiegelbild?", "spiegel", choices, {
          visualHtml: svg(
            `${shown}<line x1="70" y1="8" x2="70" y2="80" stroke="#c45c26" stroke-dasharray="4 3"/>`,
            90,
            88
          ),
          key: `mirror:${fig.id}:${faceLeft ? "l" : "r"}`,
        });
      },
    },
    {
      id: "coordinates",
      label: "Koordinatensystem",
      group: "geometrie",
      fromGrade: 5,
      fromTerm: 1,
      example: () => "z. B. 3-2",
      generate: (g, t) => {
        const max = g >= 6 ? (t === 2 ? 10 : 8) : 5;
        const x = randomInt(1, max);
        const y = randomInt(1, max);
        const ox = 22;
        const step = max >= 10 ? 10 : max >= 8 ? 11 : 14;
        const oy = 16 + (max + 1) * step;
        let grid = `<line x1="${ox}" y1="${oy}" x2="${ox + (max + 1) * step}" y2="${oy}" stroke="#1c2430"/>
                    <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - (max + 1) * step}" stroke="#1c2430"/>`;
        for (let i = 0; i <= max; i += 1) {
          grid += `<text x="${ox + i * step}" y="${oy + 12}" font-size="9" text-anchor="middle">${i}</text>`;
          grid += `<text x="${ox - 10}" y="${oy - i * step + 3}" font-size="9">${i}</text>`;
        }
        grid += `<circle cx="${ox + x * step}" cy="${oy - y * step}" r="5" fill="#c45c26"/>`;
        const w = ox + (max + 1) * step + 16;
        const h = oy + 18;
        return numberTask("coordinates", "Welche Koordinaten hat der Punkt? Schreibe z. B. 3-2", `${x}-${y}`, {
          kind: "text",
          wide: true,
          visualHtml: svg(grid, w, h),
          key: `${x}-${y}`,
        });
      },
    },
    {
      id: "angles",
      label: "Winkel",
      group: "geometrie",
      fromGrade: 6,
      fromTerm: 1,
      example: () => "z. B. rechter Winkel = 90°",
      generate: (g, t) => {
        const kinds = [
          { id: "spitz", label: "spitzer Winkel", deg: pick(t === 2 ? [20, 30, 45, 60, 70] : [30, 45, 60]) },
          { id: "recht", label: "rechter Winkel", deg: 90 },
          { id: "stumpf", label: "stumpfer Winkel", deg: pick(t === 2 ? [100, 120, 135, 150] : [120, 135, 150]) },
        ];
        const kind = pick(kinds);
        const rad = (kind.deg * Math.PI) / 180;
        const x = 70 + 40 * Math.cos(-rad);
        const y = 70 + 40 * Math.sin(-rad);
        const visual = svg(
          `<line x1="70" y1="70" x2="120" y2="70" stroke="#1c2430" stroke-width="3"/>
           <line x1="70" y1="70" x2="${x}" y2="${y}" stroke="#1c2430" stroke-width="3"/>
           <circle cx="70" cy="70" r="3" fill="#c45c26"/>`,
          140,
          100
        );
        if (kind.id === "recht" && Math.random() < (t === 2 ? 0.7 : 0.5)) {
          return numberTask("angles", "Wie groß ist der Winkel in Grad?", 90, {
            visualHtml: visual,
            key: `deg-90-${Math.round(x)}-${Math.round(y)}`,
          });
        }
        return choiceTask(
          "angles",
          "Welche Art von Winkel ist das?",
          kind.label,
          kinds.map((item) => item.label),
          {
            visualHtml: visual,
            shuffle: false,
            key: `${kind.id}-${kind.deg}`,
          }
        );
      },
    },
  ];

  return { topics, GROUP, symbols };
} 
