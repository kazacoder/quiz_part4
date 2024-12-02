(function () {
    const Text = {
        quiz: null,
        currentQuestionIndex: 1,
        questionTitleElement: null,
        progressBarElement: null,
        optionsElement: null,
        nextButtonElement: null,
        prevButtonElement: null,
        passButtonElement: null,
        userResult: [],
        init () {
            checkUserData();

            const url = new URL(location.href);
            const testId = url.searchParams.get('id');

            if (testId) {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", "https://testologia.ru/get-quiz?id=" + testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    this.startQuiz()
                } else {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html'
            }
        },
        startQuiz () {
            this.questionTitleElement = document.getElementById('title');
            this.progressBarElement = document.getElementById('progress-bar');
            this.optionsElement = document.getElementById('options');
            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.addEventListener('click', this.move.bind(this, 'next'));
            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.addEventListener('click', this.move.bind(this, 'pass'));
            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.addEventListener('click', this.move.bind(this, 'prev'));
            document.getElementById('pre-title').innerText = this.quiz.name;

            this.prepareProgressBar();
            this.showQuestion();

            const timerElement = document.getElementById('timer');
            let seconds = 59
            const interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;
                if (seconds === 0) {
                    clearInterval(interval)
                    this.complete()
                }
            }.bind(this), 1000);
        },
        prepareProgressBar() {
            for (let i = 0; i < this.quiz.questions.length; i++) {
                const itemElement = document.createElement('div');
                itemElement.className = 'test-progress-bar-item' + (i === 0 ? ' active' : '');

                const itemCircleElement = document.createElement('div');
                itemCircleElement.className = 'test-progress-bar-item-circle';

                const itemTextElement = document.createElement('div');
                itemTextElement.className = 'test-progress-bar-item-text';
                itemTextElement.innerText = `Вопрос ${i + 1}`

                itemElement.appendChild(itemCircleElement);
                itemElement.appendChild(itemTextElement);
                this.progressBarElement.appendChild(itemElement)
            }
        },
        showQuestion() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML =
                `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;
            this.optionsElement.innerHTML = '';
            const that = this;
            const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
            activeQuestion.answers.forEach((answer) => {
                const optionElement  = document.createElement('div');
                optionElement.className = 'test-question-option question-option';

                const inputId = `answer-${answer.id}`
                const inputElement  = document.createElement('input');
                inputElement.className = 'option-answer';
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('value', answer.id);
                if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    inputElement.setAttribute('checked', 'checked');
                }

                inputElement.addEventListener('change', function () {
                    that.chooseAnswer()
                })

                const labelElement  = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);

                this.optionsElement.appendChild(optionElement);
            });
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerHTML = 'Завершить';
                // this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.innerHTML = 'Дальше';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer () {
            this.nextButtonElement.removeAttribute('disabled');
        },
        move (action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(elem => {
                return elem.checked;
            });

            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = Number(chosenAnswer.value);
            }

            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            });
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            }

            if (action === 'next' || action === 'pass') {
                this.currentQuestionIndex++
            } else {
                this.currentQuestionIndex--
            }

            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            Array.from(this.progressBarElement.children).forEach((item, index) => {
                const currentItemIndex = index + 1
                item.classList.remove('active');
                item.classList.remove('complete');

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            }) ;

            this.showQuestion();

        },
        complete () {
            const url = new URL(location.href)
            const id = url.searchParams.get('id');
            const name = url.searchParams.get('name');
            const lastName = url.searchParams.get('lastName');
            const email = url.searchParams.get('email');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://testologia.ru/pass-quiz?id=' + id, false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }))

            if (xhr.status === 200 && xhr.responseText) {
                let result = null
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
                if (result) {
                    location.href = 'result.html?score='  + result.score + '&total=' + result.total;
                }
            } else {
                location.href = 'index.html';
            }
        },
    };

    Text.init();
})();