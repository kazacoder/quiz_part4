import {QuizType} from "./quiz.type";

export type UserResultType = {
    questionId: number,
    chosenAnswerId: number,
}

export type UserResultStoredType = {
    name: string,
    lastName: string,
    email: string,
    testId: number,
    results: Array<UserResultType>,
    quiz: QuizType | null,
    score?: number,
    total?: number,
}
