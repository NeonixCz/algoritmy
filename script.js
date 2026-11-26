(() => {
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const backToTop = document.querySelector(".back-to-top");

  const savedTheme = localStorage.getItem("algoritmus-theme");
  if (savedTheme === "dark") body.classList.add("dark-mode");

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("algoritmus-theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-label", isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
    document.querySelector('meta[name="theme-color"]').setAttribute("content", isDark ? "#141c17" : "#f7f8f6");
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Otevřít navigaci" : "Zavřít navigaci");
    nav.classList.toggle("open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Otevřít navigaci");
    });
  });

  const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const observedSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        sectionLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${visible.target.id}`;
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
          link.classList.toggle("active", active);
        });
      },
      { rootMargin: "-22% 0px -65% 0px", threshold: [0, 0.15, 0.5] }
    );
    observedSections.forEach((section) => navObserver.observe(section));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".process-card, .property-card, .notation-row, .symbol-card, .flowchart-panel, .logic-panel, .summary-card").forEach((element) => {
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
    document.documentElement.classList.add("reveal-ready");
  }

  const updateScrollControls = () => backToTop.classList.toggle("visible", window.scrollY > 560);
  window.addEventListener("scroll", updateScrollControls, { passive: true });
  updateScrollControls();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const practiceItems = [
    {
      type: "Výběr odpovědi",
      prompt: "Která vlastnost algoritmu zaručuje, že po konečném počtu kroků skončí?",
      options: ["Obecnost", "Konečnost", "Jednoznačnost", "Srozumitelnost"],
      answer: 1,
      explanation: "Konečnost znamená, že algoritmus dokončí svůj postup po konečném počtu kroků."
    },
    {
      type: "Pravda, nebo nepravda?",
      prompt: "Rozhodovací blok vývojového diagramu se kreslí jako kosočtverec.",
      options: ["Pravda", "Nepravda"],
      answer: 0,
      explanation: "Kosočtverec označuje rozhodnutí a rozděluje tok například na větve ANO a NE."
    },
    {
      type: "Doplň pojem",
      prompt: "Značka pro začátek a konec algoritmu se nazývá …",
      answerText: ["mezní značka", "mezni znacka", "terminál"],
      answerDisplay: "mezní značka",
      explanation: "Mezní značka má tvar oválu a označuje začátek nebo konec."
    },
    {
      type: "Rozpoznávání značky",
      prompt: "Který tvar označuje načítání vstupních dat?",
      options: ["Obdélník", "Ovál", "Kosodélník", "Kosočtverec"],
      answer: 2,
      explanation: "Vstup i výstup označuje kosodélník. Obdélník slouží ke zpracování."
    },
    {
      type: "Pravda, nebo nepravda?",
      prompt: "Při odmocňování záporného čísla může algoritmus v oboru reálných čísel pokračovat bez ošetření.",
      options: ["Pravda", "Nepravda"],
      answer: 1,
      explanation: "V oboru reálných čísel musí být výraz pod odmocninou nezáporný. Algoritmus má tuto podmínku ověřit."
    },
    {
      type: "Doplň pojem",
      prompt: "Jak se nazývá vlastnost, díky které stejné vstupy za stejných podmínek dávají stejný výsledek?",
      answerText: ["opakovatelnost", "determinismus", "opakovateln"],
      answerDisplay: "opakovatelnost (determinismus)",
      explanation: "Opakovatelnost neboli determinismus zaručuje stejný výsledek při stejném vstupu a stejných podmínkách."
    }
  ];

  const questionElement = document.querySelector("#practice-question");
  const typeElement = document.querySelector("#practice-type");
  const currentElement = document.querySelector("#practice-current");
  const progressElement = document.querySelector("#practice-progress-bar");
  const feedbackElement = document.querySelector("#practice-feedback");
  const submitButton = document.querySelector("#practice-submit");
  const nextButton = document.querySelector("#practice-next");
  let practiceIndex = 0;
  let practiceLocked = false;

  function renderPractice() {
    const item = practiceItems[practiceIndex];
    practiceLocked = false;
    typeElement.textContent = item.type;
    currentElement.textContent = String(practiceIndex + 1).padStart(2, "0");
    document.querySelector("#practice-total").textContent = String(practiceItems.length).padStart(2, "0");
    progressElement.style.width = `${((practiceIndex + 1) / practiceItems.length) * 100}%`;
    feedbackElement.hidden = true;
    feedbackElement.textContent = "";
    nextButton.hidden = true;
    submitButton.hidden = false;
    submitButton.disabled = true;

    const prompt = document.createElement("p");
    prompt.className = "practice-prompt";
    prompt.textContent = item.prompt;
    questionElement.replaceChildren(prompt);

    if (item.options) {
      const options = document.createElement("div");
      options.className = item.options.length === 2 ? "true-false-options" : "practice-options";
      item.options.forEach((option, index) => {
        const label = document.createElement("label");
        label.className = `practice-option${item.options.length === 2 ? " practice-boolean" : ""}`;
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "practice-answer";
        input.value = String(index);
        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = item.options.length === 2 ? (index === 0 ? "✓" : "×") : String.fromCharCode(97 + index);
        const text = document.createElement("span");
        text.textContent = option;
        label.append(input, letter, text);
        options.append(label);
        input.addEventListener("change", () => { submitButton.disabled = false; });
      });
      questionElement.append(options);
    } else {
      const input = document.createElement("input");
      input.className = "practice-input";
      input.type = "text";
      input.autocomplete = "off";
      input.placeholder = "Napiš odpověď…";
      input.setAttribute("aria-label", "Odpověď na otázku");
      questionElement.append(input);
      input.addEventListener("input", () => { submitButton.disabled = input.value.trim().length === 0; });
    }
  }

  function normalizeAnswer(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  submitButton.addEventListener("click", () => {
    if (practiceLocked) return;
    const item = practiceItems[practiceIndex];
    const selected = questionElement.querySelector('input[type="radio"]:checked');
    const textInput = questionElement.querySelector('input[type="text"]');
    const isCorrect = item.options
      ? selected !== null && Number(selected.value) === item.answer
      : item.answerText.some((answer) => normalizeAnswer(textInput.value).includes(normalizeAnswer(answer)));

    practiceLocked = true;
    submitButton.hidden = true;
    feedbackElement.hidden = false;
    feedbackElement.classList.toggle("incorrect", !isCorrect);
    const answerText = item.options ? item.options[item.answer] : item.answerDisplay;
    feedbackElement.textContent = `${isCorrect ? "Správně! " : `Tentokrát ne. Správná odpověď: ${answerText}. `}${item.explanation}`;
    nextButton.hidden = false;
    nextButton.textContent = practiceIndex === practiceItems.length - 1 ? "Začít znovu" : "Další otázka →";
  });

  nextButton.addEventListener("click", () => {
    practiceIndex = (practiceIndex + 1) % practiceItems.length;
    renderPractice();
  });
  renderPractice();

  const examForm = document.querySelector("#exam-form");
  const resultElement = document.querySelector("#exam-result");
  const correctAnswers = ["c", "b", "c", "d", "b"];
  const explanations = [
    "Věcná nesprávnost znamená, že program neřeší úlohu správně a může vracet chybné výsledky.",
    "Závorky musí jasně vymezit celý čitatel i celý jmenovatel.",
    "Kosodélník označuje vstup i výstup; načítání vstupních dat patří právě sem.",
    "Opakovatelnost, tedy determinismus, zajišťuje stejný výsledek pro stejný vstup.",
    "Překladač převádí program z programovacího jazyka do strojového kódu."
  ];
  const openEvaluators = [
    {
      keys: ["konecnost", "vecna spravnost", "jednoznacnost", "obecnost", "opakovatelnost", "srozumitelnost"],
      answer: "Konečnost, věcná správnost, jednoznačnost, obecnost, opakovatelnost a srozumitelnost."
    },
    {
      groups: [["nulou", "deleni nulou", "jmenovatel"], ["odmocnin", "odmocninou", "pod odmocninou", "zaporn"]],
      answer: "Dělení nulou (nulový jmenovatel) a odmocnění záporného výrazu v oboru reálných čísel."
    },
    {
      groups: [["and", "vsechny", "obě", "obe", "soucasne"], ["or", "alespon", "jedna", "nebo"]],
      answer: "AND vyžaduje, aby platily všechny podmínky. OR vyžaduje, aby platila alespoň jedna."
    },
    {
      keys: ["propo", "spoji", "casti", "diagramu", "tok", "kříž", "kriz"],
      answer: "Spojka propojuje části vývojového diagramu a pomáhá vyhnout se dlouhým nebo křížícím se spojovacím čarám."
    }
  ];

  examForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let score = 0;
    const lines = [];
    correctAnswers.forEach((correct, index) => {
      const chosen = examForm.querySelector(`input[name="exam-${index + 1}"]:checked`);
      const isCorrect = chosen?.value === correct;
      if (isCorrect) score += 1;
      lines.push(`<li class="${isCorrect ? "" : "incorrect-result"}"><strong>${index + 1}. otázka — ${isCorrect ? "správně." : `správná odpověď: ${correct}).`}</strong> ${explanations[index]}</li>`);
    });
    openEvaluators.forEach((grader, index) => {
      const answer = normalizeAnswer(examForm.querySelector(`#open-${index + 1}`).value);
      const isCorrect = grader.groups
        ? grader.groups.every((group) => group.some((word) => answer.includes(normalizeAnswer(word))))
        : grader.keys.every((word) => answer.includes(normalizeAnswer(word)));
      if (isCorrect) score += 1;
      lines.push(`<li class="${isCorrect ? "" : "incorrect-result"}"><strong>${index + 6}. otázka — ${isCorrect ? "správně." : "očekávaná odpověď:"}</strong> ${grader.answer}</li>`);
    });
    const percentage = Math.round((score / 9) * 100);
    const resultHeading = score >= 8 ? "Skvěle zvládnuto!" : score >= 5 ? "Dobrá práce, ještě to doladíš." : "Dobrá příležitost k opakování.";
    resultElement.innerHTML = `<h3>${resultHeading}</h3><p class="exam-result-score">Získal/a jsi ${score} z 9 bodů · ${percentage}% úspěšnost</p><ul>${lines.join("")}</ul>`;
    resultElement.hidden = false;
    resultElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  document.querySelector("#exam-reset").addEventListener("click", () => {
    resultElement.hidden = true;
    resultElement.replaceChildren();
  });
})();
