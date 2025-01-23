import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UrlManager} from "../utils/url-manager";

export class Answers {
    constructor() {
        this.routeParams = UrlManager.getQueryParams()

        this.quiz = null;
        this.testId = null;

        this.personElement = document.getElementById('answers-person');
        this.answersElement = document.getElementById('answers-questions');
        this.testTitleElement = document.getElementById('test-title');

        if (this.routeParams) {
            this.getRightAnswers()
        } else {
            location.href = '#/';
        }
        document.getElementById('back').addEventListener('click', (e) => {
            location.href = '#/result?id=' + this.routeParams.id;
        })
    }

    async getRightAnswers() {
        const userInfo = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
        }
        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(
                    config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId,
                )
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                    this.showAnswers()
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
        location.href = '#/';
    }

    showAnswers() {
        this.testTitleElement.innerText = this.quiz.test.name

        const userInto = Auth.getUserInfo()
        if (userInto) {
            this.personElement.innerText = `${userInto.fullName}, ${userInto.email}`;
        }

        this.answersElement.innerHTML = '';

        this.quiz.test.questions.forEach((question, qIndex) => {
            const answerQuestionElement = document.createElement('div');
            answerQuestionElement.className = 'answer-question';
            const answerQuestionTitleElement = document.createElement('div');
            answerQuestionTitleElement.className = 'answer-question-title medium-title';
            answerQuestionTitleElement.innerHTML = `<span>Вопрос ${qIndex + 1}: </span>${question.question}`;
            const answersQuestionUlElement = document.createElement('ul');
            answersQuestionUlElement.className = 'answers-question-options'

            question.answers.forEach((answer) => {
                const answersQuestionLiElement = document.createElement('li');
                answersQuestionLiElement.className = 'answers-question-option question-option'
                if (answer.correct) {
                    answersQuestionLiElement.classList.add('success');
                } else if (answer.correct === false) {
                    answersQuestionLiElement.classList.add('wrong');
                }
                answersQuestionLiElement.innerText = answer.answer
                answersQuestionUlElement.appendChild(answersQuestionLiElement);
            })

            answerQuestionElement.appendChild(answerQuestionTitleElement);
            answerQuestionElement.appendChild(answersQuestionUlElement);
            this.answersElement.appendChild(answerQuestionElement);
        })
    }
}