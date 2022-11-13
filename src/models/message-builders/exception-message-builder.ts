export class ExceptionMessageBuilder {
    private strings: string[];

    constructor() {
        this.strings = [];
    }

    append(str: string) {
        this.strings.push(str);
    }

    appendWithDepth(depth: number, str: string) {
        const indentation = '  '.repeat(depth);
        this.append(`${indentation}${str}`);
    }

    toString() {
        const result = this.strings
            .filter((str) => str.trim().length !== 0)
            .join('\n');
        this.strings = [];
        return result.trimEnd();
    }
}
