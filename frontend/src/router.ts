import {Form} from "./components/form";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Answers} from "./components/answers";
import {Auth} from "./services/auth";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.pageTitleElement = document.getElementById('page-title');
        this.profileElement = document.getElementById('profile');
        this.profileFullNameElement = document.getElementById('profile-full-name');


        this.routes = [
            {
                route: '#/',
                title: 'Айтилогия Quiz',
                template: 'templates/index.html',
                styles: 'styles/index.css',
                load: () => {

                },
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                },
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                },
            },
            {
                route: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'styles/choice.css',
                load: () => {
                    new Choice();
                },
            },
            {
                route: '#/test',
                title: 'Выбор теста',
                template: 'templates/test.html',
                styles: 'styles/test.css',
                load: () => {
                    new Test();
                },
            },
            {
                route: '#/result',
                title: 'Результат',
                template: 'templates/result.html',
                styles: 'styles/result.css',
                load: () => {
                    new Result();
                },
            },
            {
                route: '#/answers',
                title: 'Правильные ответы',
                template: 'templates/answers.html',
                styles: 'styles/answers.css',
                load: () => {
                    new Answers();
                },
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0]

        if (urlRoute === '#/logout') {
            await Auth.logout()
            window.location.href = '#/';

            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text());

        this.stylesElement.setAttribute('href', newRoute.styles);
        this.pageTitleElement.innerText = newRoute.title;

        const userInto = Auth.getUserInfo()
        const accessToken = localStorage.getItem(Auth.accessTokenKey);

        if (userInto && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileFullNameElement.innerText = userInto.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load()
    }
}