(function () {
    const Answers = {
        person: null,
        personElement: null,
        rightResult: null,
        quiz: null,
        testId: null,
        answersElement: null,
        userResult: null,
        init() {
            const userResultRaw = sessionStorage.getItem('storedResult');
            if (userResultRaw) {
                this.userResult = JSON.parse(userResultRaw);
            } else {
                location.href = 'index.html';
            }
            this.testId = this.userResult.testId;
            const name =this.userResult.name;
            const lastName = this.userResult.lastName;
            const email = this.userResult.email;
            this.personElement = document.getElementById('answers-person');
            this.answersElement = document.getElementById('answers-questions');
            if (name && lastName && email) {
                this.person = `${name} ${lastName}, ${email}`;
                this.personElement.innerHTML = this.person;
            } else {
                location.href = 'index.html';
            }
            if (this.testId) {
                this.getQuestions();
                this.getRightAnswers();
                this.showAnswers.call(this)
            } else {
                location.href = 'index.html';
            }
            document.getElementById('back').addEventListener('click', (e) => {
                location.href = 'result.html';
            })
        },
        getQuestions() {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "https://testologia.ru/get-quiz?id=" + this.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }

        },
        getRightAnswers() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.ru/get-quiz-right?id='  + this.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.rightResult = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
        },
        showAnswers () {
            this.answersElement.innerHTML = '';
            this.quiz.questions.forEach((question, qIndex) => {
                const answerQuestionElement = document.createElement('div');
                answerQuestionElement.className = 'answer-question';

                const answerQuestionTitleElement = document.createElement('div');
                answerQuestionTitleElement.className = 'answer-question-title medium-title';
                answerQuestionTitleElement.innerHTML = `<span>Вопрос ${question.id}: </span>${question.question}`;


                const answersQuestionUlElement = document.createElement('ul');
                answersQuestionUlElement.className = 'answers-question-options'
                question.answers.forEach((answer, aIndex) => {
                    const answersQuestionLiElement = document.createElement('li');
                    answersQuestionLiElement.className = 'answers-question-option question-option'
                    if (this.userResult.results[qIndex]['chosenAnswerId'] === this.rightResult[qIndex] && answer.id === this.userResult.results[qIndex]['chosenAnswerId']) {
                        answersQuestionLiElement.classList.add('success');
                    } else if (this.userResult.results[qIndex]['chosenAnswerId'] && this.userResult.results[qIndex]['chosenAnswerId'] === answer.id) {
                        answersQuestionLiElement.classList.add('wrong');
                    }
                    answersQuestionLiElement.innerText = answer.answer
                    answersQuestionUlElement.appendChild(answersQuestionLiElement);
                })

                answerQuestionElement.appendChild(answerQuestionTitleElement);
                answerQuestionElement.appendChild(answersQuestionUlElement);
                this.answersElement.appendChild(answerQuestionElement);
            })
        },

    }

    Answers.init()
})()
