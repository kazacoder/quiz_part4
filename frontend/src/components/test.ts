import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";

export class Test {
    constructor() {
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.questionTitleElement = null;
        this.progressBarElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.passAction = null;
        this.userResult = [];
        this.rightAnswers = [];
        this.interval = null;

        this.routeParams = UrlManager.getQueryParams();

        const url = new URL(location.href);
        const testId = url.searchParams.get('id');

        this.init();


    }

    async init() {

        if (this.routeParams.id) {


            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result
                    this.startQuiz();
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    startQuiz() {
        this.questionTitleElement = document.getElementById('title');
        this.progressBarElement = document.getElementById('progress-bar');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.addEventListener('click', this.move.bind(this, 'next'));
        this.passButtonElement = document.getElementById('pass');
        this.passAction = this.move.bind(this, 'pass')
        this.passButtonElement.addEventListener('click', this.passAction);
        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.addEventListener('click', this.move.bind(this, 'prev'));
        document.getElementById('pre-title').innerText = this.quiz.name;

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59
        this.interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;
            if (seconds === 0) {
                clearInterval(this.interval)
                this.complete()
            }
        }.bind(this), 1000);
    }

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
    }


    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.questionTitleElement.innerHTML =
            `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;
        this.optionsElement.innerHTML = '';
        const that = this;
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
        activeQuestion.answers.forEach((answer) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'test-question-option question-option';

            const inputId = `answer-${answer.id}`
            const inputElement = document.createElement('input');
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

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            this.optionsElement.appendChild(optionElement);
        });
        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passButtonElement.parentElement.classList.add('disabled');
            this.passButtonElement.removeEventListener('click', this.passAction);
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            this.passButtonElement.parentElement.classList.remove('disabled');
            this.passButtonElement.addEventListener('click', this.passAction);
        }
        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerHTML = 'Завершить';
        } else {
            this.nextButtonElement.innerHTML = 'Дальше';
        }
        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }
    }

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passButtonElement.parentElement.classList.add('disabled');
        this.passButtonElement.removeEventListener('click', this.passAction);
    }

    move(action) {
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
            clearInterval(this.interval)
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
        });

        this.showQuestion();

    }

    async complete() {

        //////////////////
        const storedResult = {
            name: this.routeParams.name,
            lastName: this.routeParams.lastName,
            email: this.routeParams.email,
            testId: this.routeParams.id,
            results: this.userResult,
            quiz: this.quiz
        }

        sessionStorage.removeItem('storedResult')
        /////////////

        const userInfo = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
        }


        try {
            const result = await CustomHttp.request(
                config.host + '/tests/' + this.routeParams.id + '/pass',
                'POST',
                {
                    userId: userInfo.userId,
                    results: this.userResult,
                }
            )

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                storedResult.score = result.score;
                storedResult.total = result.total;
                location.href = '#/result?id=' + this.routeParams.id;
                sessionStorage.setItem('storedResult', JSON.stringify(storedResult))
            }
        } catch (error) {
            console.log(error)
        }
    }
}