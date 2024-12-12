import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";

export class Choice {

    constructor() {
        this.quizzes = [];
        this.routeParams = UrlManager.getQueryParams();

        this.init();

    }

    async init() {
        try {
            const result = await CustomHttp.request('http://localhost:3000/api/tests')
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.quizzes = result
                this.processQuizzes();
            }
        } catch (error) {
            console.log(error)
        }
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice-options');
        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach((quiz) => {
                const that = this;
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.addEventListener('click', function () {
                    that.chooseQuiz(this)
                });

                const choiceOptionTextElement = document.createElement('div');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('div');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'Стрелка');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            })
        }
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?name=' + this.routeParams.name + '&lastName=' + this.routeParams.lastName +
                '&email=' + this.routeParams.email + '&id=' + dataId;
        }

    }
}