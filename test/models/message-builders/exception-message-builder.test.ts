import { ExceptionMessageBuilder } from '../../../src/models/message-builders/exception-message-builder';

describe('Exception Message Builder Test Suite', () => {
    describe('append', () => {
        test('Should build message with no string', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = '';

            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });

        test('Should build message with one string', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = 'a';

            builder.append('a');
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });

        test('Should build message with more than one string', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = 'a\nb';

            builder.append('a');
            builder.append('b');
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });

        test('Should trim extra new lines', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = 'a';

            builder.append('a');
            builder.append('');
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });

        test('Should trim random new lines', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = 'a\nb';
            builder.append('a');
            builder.append('');
            builder.append('');
            builder.append('');
            builder.append('b');
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });
    });

    describe('appendWithDepth', () => {
        test('Should append a message at depth of 0', () => {
            const builder = new ExceptionMessageBuilder();
            const expectedMessage = 'a';

            builder.appendWithDepth(0, expectedMessage);
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });

        test('Should append a message at depth of 3', () => {
            const builder = new ExceptionMessageBuilder();
            const depth = 3;
            const messageToAppend = 'a';
            const expectedIndentation = '\t'.repeat(depth);
            const expectedMessage = `${expectedIndentation}${messageToAppend}`;

            builder.appendWithDepth(3, messageToAppend);
            const actualMessage = builder.toString();

            expect(actualMessage).toEqual(expectedMessage);
        });
    });
});
