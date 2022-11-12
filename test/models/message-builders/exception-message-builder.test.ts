import { ExceptionMessageBuilder } from '../../../src/exceptions/models/message-builders/exception-message-builder';

describe('Exception Message Builder Test Suite', () => {
    test('should build message with no string', () => {
        const builder = new ExceptionMessageBuilder();
        const expectedMessage = '';

        const actualMessage = builder.toString();

        expect(actualMessage).toEqual(expectedMessage);
    });

    test('should build message with one string', () => {
        const builder = new ExceptionMessageBuilder();
        const expectedMessage = 'a';

        builder.append('a');
        const actualMessage = builder.toString();

        expect(actualMessage).toEqual(expectedMessage);
    });

    test('should build message with more than one string', () => {
        const builder = new ExceptionMessageBuilder();
        const expectedMessage = 'a\nb';

        builder.append('a');
        builder.append('b');
        const actualMessage = builder.toString();

        expect(actualMessage).toEqual(expectedMessage);
    });
});
