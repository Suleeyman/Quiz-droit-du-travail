async function fetchQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();

  return data;
}

class Toast {
  static popup(correct) {
    const texte = `${correct ? "✅ Bonne" : "🔴 Mauvaise"} réponse`;
    document.querySelector(".toast")?.remove();
    document.body.insertAdjacentHTML(
      "afterbegin",
      `
            <div class="toast ${correct ? "correct" : "wrong"}">${texte}</div>
        `
    );
  }

  static unpop() {
    document.querySelector(".toast")?.remove();
  }
}

class Card {
  question;
  options;
  answer;
  id;

  constructor(question, options, answer, id) {
    this.question = question;
    this.options = options;
    this.answer = answer;
    this.id = id;
  }

  generateOption(option, correct) {
    if (correct) {
      return `
            <li class="card__option" data-correct="correct">${option}</li>
        `;
    }
    return `
        <li class="card__option">${option}</li>
    `;
  }

  generateCard() {
    const acc = this.options.map((o, i) =>
      this.generateOption(o, this.answer === i + 1)
    );
    return `
          <div class="card" id="qid${this.id}">
              <h2 class="card__question">${this.question}</h2>
              <ul class="card__options">
                ${acc.join("")}
              </ul>
          </div>
      `;
  }

  listenCard(Quizz) {
    const card = document.querySelector(`.card#qid${this.id}`);
    let locked = false;
    card.addEventListener("click", function (e) {
      if (locked) return;
      locked = true;
      const target = e.target;
      console.log(target);
      console.log(target.dataset);
      if (!target.classList.contains("card__option")) {
        locked = false;
        return;
      }
      const correctAnswer =
        target.dataset.correct && target.dataset.correct === "correct";

      if (correctAnswer) {
        target.classList.add("correct");
      } else {
        target.classList.add("wrong");
      }
      Toast.popup(correctAnswer);
      setTimeout(() => {
        Quizz.next(correctAnswer);
        Toast.unpop();
      }, 1000);
    });
  }
}

class Score {
  correctSpan;
  incorrectSpan;

  constructor(correctSpan, incorrectSpan, total) {
    this.correctSpan = correctSpan;
    this.incorrectSpan = incorrectSpan;
    this.total;
  }

  setScore(correct, incorrect) {
    this.correctSpan.innerHTML = "";
    this.incorrectSpan.innerHTML = "";

    this.correctSpan.insertAdjacentHTML(
      "afterbegin",
      `
        <span class="score">
            ${correct}
        </span>
    `
    );

    this.incorrectSpan.insertAdjacentHTML(
      "afterbegin",
      `
        <span class="score">
            ${incorrect}
        </span>
    `
    );
  }
}

class Quizz {
  #questions;
  currentQuestion = 0;
  timer;
  #shuffledQuestions;
  correctAnswers = 0;
  incorrectAnswers = 0;
  app;
  locked = false;
  score;

  constructor(questions, app) {
    this.#questions = questions;
    this.app = app;
    this.score = new Score(
      document.querySelector(".correct > .score"),
      document.querySelector(".wrong > .score"),
      questions.length
    );
    this.start();
  }

  start() {
    this.#shuffledQuestions = this.#questions
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    this.correctAnswers = this.incorrectAnswers = 0;
    this.score.setScore(0, 0);
    this.popQuestion();
  }

  popQuestion() {
    const question = this.#shuffledQuestions[this.currentQuestion];
    const card = new Card(
      question.question,
      question.choix,
      question.reponse,
      this.currentQuestion
    );
    this.app.innerHTML = "";
    this.app.insertAdjacentHTML("afterbegin", card.generateCard());
    card.listenCard(this);
  }

  next(correct) {
    this.currentQuestion++;
    if (correct) {
      this.correctAnswers++;
    } else {
      this.incorrectAnswers++;
    }
    this.score.setScore(this.correctAnswers, this.incorrectAnswers);

    if (this.currentQuestion === this.#questions.length) {
      this.finalScore();
      return;
    }

    this.popQuestion();
  }

  finalScore() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="final">
            <div class="final__result">
                <h2>Votre score final</h2>
                <div class="body-stat">
                    <p class="correct-body">${this.correctAnswers} ✅<p>
                    <p class="wrong-body">${this.incorrectAnswers} 🔴<p>
                </div>
                <button type="button" class="primary" id="restart">🎓 Rejouer</button>
            </div>
        </div>
    `
    );

    document.querySelector("#restart").addEventListener("click", function () {
      window.location.reload();
    });
  }
}

window.addEventListener("DOMContentLoaded", async function () {
  const app = document.querySelector("#app");
  const questions = await fetchQuestions();

  console.log(questions);

  if (app) {
    const quizz = new Quizz(questions, app);
  }
});
