export class ExceptionMessageBuilder {
    private strings: string[];

    constructor() {
        this.strings = [];
    }

    append(str: string) {
        this.strings.push(str);
    }

    toString() {
        const result = this.strings.join('\n');
        this.strings = [];
        return result;
    }
}
