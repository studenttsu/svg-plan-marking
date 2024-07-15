import { makeAutoObservable } from 'mobx';

export const Colors: Record<number, string> = {
    1: '#FED215',
    2: '#CFABFD',
}

export class State {
    isOperatorMode = true;
    activeSubdivision: any;

    data = [
        {
            subdivisionId: 1,
            subdivisionName: 'Аппарат генерального директора',
            color: '#FED215',
            places: [
                { office: 1, place: 1, employeeId: '8dead5ee-f240-4054-b2f2-d6f1237d016b' },
                { office: 1, place: 2, employeeId: '8dead5ee-f240-4054-b2f2-d6f1237d016b' },
            ]
        },
        {
            subdivisionId: 2,
            subdivisionName: 'Корпоративный офис',
            color: '#CFABFD',
            places: [
                { office: 2, place: 1 },
                { office: 2, place: 2 },
            ]
        }
    ];

    constructor() {
        makeAutoObservable(this);
    }

    getEmployee(office: any, place: any) {
        return {
            name: 'Сидоров Иван Иванович'
        }
    }

    setActiveSubdivision(subdivisionId: number) {
        this.activeSubdivision = this.activeSubdivision !== subdivisionId ? subdivisionId : null;
    }

    getSubdivisionId(office: any, place: any) {
        return this.data.find(item => item.places.some(x => x.place === parseInt(place, 0) && x.office === parseInt(office, 0)))?.subdivisionId;
    }
}

export const state = new State();