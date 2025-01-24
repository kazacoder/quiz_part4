import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UrlManager} from "../utils/url-manager";
import {QueryParamsType} from "../types/query-params.type";
import {QuizAnswerType, QuizQuestionType, QuizResultType} from "../types/quiz.type";
import {UserInfoType} from "../types/user-info.type";

export class Answers {
    readonly routeParams: QueryParamsType;
    private quiz: QuizResultType | null;
    private personElement: HTMLElement | null;
    private answersElement: HTMLElement | null;
    private testTitleElement: HTMLElement | null;

    constructor() {
        this.routeParams = UrlManager.getQueryParams()
        this.quiz = null;
        this.personElement = document.getElementById('answers-person');
        this.answersElement = document.getElementById('answers-questions');
        this.testTitleElement = document.getElementById('test-title');

        if (this.routeParams) {
            this.getRightAnswers().then();
        } else {
            location.href = '#/';
        }
        const backButtonElement: HTMLElement | null = document.getElementById('back')
        if (backButtonElement) {
            backButtonElement.addEventListener('click', () => {
                location.href = '#/result?id=' + this.routeParams.id;
            })
        }
    }

    private async getRightAnswers(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
        }
        if (this.routeParams.id && userInfo) {
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

    private showAnswers(): void {
        if (!this.quiz) return;
        if (this.testTitleElement) {
            this.testTitleElement.innerText = this.quiz.test.name
        }

        const userInto: UserInfoType | null = Auth.getUserInfo()
        if (userInto && this.personElement) {
            this.personElement.innerText = `${userInto.fullName}, ${userInto.email}`;
        }

        if (this.answersElement) {
            this.answersElement.innerHTML = '';
        }

        this.quiz.test.questions.forEach((question: QuizQuestionType, qIndex: number) => {
            const answerQuestionElement: HTMLElement = document.createElement('div');
            answerQuestionElement.className = 'answer-question';
            const answerQuestionTitleElement: HTMLElement = document.createElement('div');
            answerQuestionTitleElement.className = 'answer-question-title medium-title';
            answerQuestionTitleElement.innerHTML = `<span>Вопрос ${qIndex + 1}: </span>${question.question}`;
            const answersQuestionUlElement: HTMLElement = document.createElement('ul');
            answersQuestionUlElement.className = 'answers-question-options'

            question.answers.forEach((answer: QuizAnswerType) => {
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
            if (this.answersElement) {
                this.answersElement.appendChild(answerQuestionElement);
            }
        })
    }
}