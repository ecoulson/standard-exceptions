import { Exception } from '../../../src/exceptions/models/exceptions/exception';

describe('Exception Test Suite', () => {
    describe('fromError', () => {
        test('Should return itself when the parameter is an exception', () => {
            const inputError = new Exception();
            const expectedError = new Exception();

            const actualError = Exception.fromError(inputError);

            expect(actualError.equals(expectedError)).toBeTruthy();
        });

        test('Should return a new exception when the parameter is an error', () => {
            const inputError = new Error('message');
            const expectedError = new Exception('message');
            expectedError.name = inputError.name;
            expectedError.stack = inputError.stack;

            const actualError = Exception.fromError(inputError);

            expect(actualError.equals(expectedError)).toBeTruthy();
        });

        test('Should return an exception with a message when the parameter is a symbol', () => {
            const inputError = Symbol.for('error');
            const expectedError = new Exception('Symbol(error)');

            const actualError = Exception.fromError(inputError);

            expect(actualError.equals(expectedError)).toBeTruthy();
        });

        test('Should return an exception with a message when the parameter is a string', () => {
            const inputError = 'error';
            const expectedError = new Exception('error');

            const actualError = Exception.fromError(inputError);

            expect(actualError.equals(expectedError)).toBeTruthy();
        });

        test('Should return an exception with a message when the parameter is anything else', () => {
            const inputError: any[] = [];
            const expectedError = new Exception(String([]));

            const actualError = Exception.fromError(inputError);

            expect(actualError.equals(expectedError)).toBeTruthy();
        });
    });

    describe('upsertDataList', () => {
        test('Should add a message to a key', () => {
            const inputKey = 'key';
            const inputValue = 'value';
            const expectedKey = inputKey;
            const expectedValues = [inputValue];
            const exception = new Exception();

            exception.upsertDataList(inputKey, inputValue);

            expect(exception.data.has(expectedKey)).toBeTruthy();
            expect(exception.data.get(expectedKey)).toEqual(expectedValues);
        });

        test('Should create a new key in the data and add a message', () => {
            const inputKey = 'key';
            const inputValue = 'valueC';
            const existingValues = ['valueA', 'valueB'];
            const expectedKey = inputKey;
            const expectedValues = [...existingValues, inputValue];
            const exception = new Exception(
                '',
                null,
                new Map([[inputKey, existingValues]])
            );

            exception.upsertDataList(inputKey, inputValue);

            expect(exception.data.has(expectedKey)).toBeTruthy();
            expect(exception.data.get(expectedKey)).toEqual(expectedValues);
        });
    });

    describe('throwIfContainsErrors', () => {
        test('Should not throw since when exception has no errors', () => {
            const exception = new Exception();

            exception.throwIfContainsErrors();
        });

        test('Should throw when the exception contains errors', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['message']]])
            );

            const action = () => exception.throwIfContainsErrors();
            expect(action).toThrow();
        });
    });

    describe('addExceptionData', () => {
        test('Should not add any data when the exception data is null', () => {
            const inputExceptionData = null as any;
            const exception = new Exception();
            const expectedData = new Map<string, string[]>();

            exception.addExceptionData(inputExceptionData);

            expect(exception.data).toEqual(expectedData);
        });

        test('Should add data when the exception data is not null', () => {
            const inputExceptionData = new Map<string, string[]>([
                ['key2', ['message']],
            ]);
            const existingData = new Map<string, string[]>([
                ['key1', ['message']],
            ]);
            const exception = new Exception('', null, existingData);
            const expectedData = new Map<string, string[]>([
                ['key1', ['message']],
                ['key2', ['message']],
            ]);

            exception.addExceptionData(inputExceptionData);

            expect(exception.data).toEqual(expectedData);
        });
    });

    describe('addErrorMessages', () => {
        test('Should add error messages to the exception', () => {
            const exception = new Exception();
            const expectedData = new Map([['key', ['message']]]);

            exception.addErrorMessages('key', ['message']);

            expect(exception.data).toEqual(expectedData);
        });

        test('Should throw an exception when adding a duplicate key', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['messages']]])
            );
            const inputKey = 'key';
            const expectedError = new Exception(
                `Exception data already contains the key: ${inputKey}.`
            );

            const action = () =>
                exception.addErrorMessages(inputKey, ['message']);
            expect(action).toThrowError(expectedError);
        });
    });

    describe('equals', () => {
        test('Should be true when the name, message, innerException, and data are equivalent', () => {
            const exceptionA = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const exceptionB = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const expectedResult = true;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be true when the innerExceptions are both null', () => {
            const exceptionA = new Exception(
                'message',
                null,
                new Map([['key', ['message']]])
            );
            const exceptionB = new Exception(
                'message',
                null,
                new Map([['key', ['message']]])
            );
            const expectedResult = true;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be true when the innerExceptions are both exceptions', () => {
            const exceptionA = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const exceptionB = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const expectedResult = true;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the innerExceptions are an exception and a null', () => {
            const exceptionA = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const exceptionB = new Exception(
                'message',
                null,
                new Map([['key', ['message']]])
            );
            const expectedResult = false;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the innerExceptions are an unequal exceptions', () => {
            const exceptionA = new Exception(
                'message',
                new Exception('inner message'),
                new Map([['key', ['message']]])
            );
            const exceptionB = new Exception(
                'message',
                new Exception(),
                new Map([['key', ['message']]])
            );
            const expectedResult = false;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the messages do not match', () => {
            const exceptionA = new Exception('messageA');
            const exceptionB = new Exception('messageB');
            const expectedResult = false;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the names do not match', () => {
            const exceptionA = new Exception('messageA');
            exceptionA.name = 'ExceptionA';
            const exceptionB = new Exception('messageB');
            exceptionA.name = 'ExceptionB';
            const expectedResult = false;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the exception data differs', () => {
            const exceptionA = new Exception(
                'message',
                new Exception(),
                new Map([['key', ['messageA']]])
            );
            const exceptionB = new Exception(
                'message',
                new Exception(),
                new Map([['key', ['messageB']]])
            );
            const expectedResult = false;

            const actualResult = exceptionA.equals(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('equalsWithDetails', () => {
        test('Should be true and have no details when the exceptions are equal', () => {
            const exceptionA = new Exception(
                'messages',
                new Exception(),
                new Map([['key', ['data']]])
            );
            const exceptionB = new Exception(
                'messages',
                new Exception(),
                new Map([['key', ['data']]])
            );
            const expectedResult = [true, ''];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when the name does not match', () => {
            const exceptionA = new Exception();
            const exceptionB = new Exception();
            exceptionA.name = 'ExceptionA';
            exceptionB.name = 'ExceptionB';
            const expectedResult = [
                false,
                'Expected exception name to be "ExceptionB", was "ExceptionA".',
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when an inner exception is expected', () => {
            const exceptionA = new Exception('message');
            const exceptionB = new Exception('message', new Exception());
            const expectedResult = [
                false,
                'Expected an inner exception of type [Exception].',
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when an inner exception is not expected', () => {
            const innerException = new Exception();
            innerException.name = 'LowerLevelException';
            const exceptionA = new Exception('message', innerException);
            const exceptionB = new Exception('message');
            const expectedResult = [
                false,
                'Did not expect an inner exception of type [LowerLevelException].',
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when the inner exception does not match', () => {
            const exceptionA = new Exception('message', new Exception());
            const exceptionB = new Exception(
                'message',
                new Exception('inner message', new Exception())
            );
            const expectedResult = [
                false,
                [
                    '[Exception]:',
                    '  Expected exception message to be "inner message", was "".',
                    '  Expected an inner exception of type [Exception].',
                ].join('\n'),
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);
            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when the nested inner exception does not match', () => {
            const exceptionA = new Exception(
                'message',
                new Exception('inner message 1', new Exception())
            );
            const exceptionB = new Exception(
                'message',
                new Exception(
                    'inner message 1',
                    new Exception('inner message 2', new Exception())
                )
            );
            const expectedResult = [
                false,
                [
                    '[Exception]:',
                    '  [Exception]:',
                    '    Expected exception message to be "inner message 2", was "".',
                    '    Expected an inner exception of type [Exception].',
                ].join('\n'),
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);
            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when the messages do not match', () => {
            const exceptionA = new Exception('messageA');
            const exceptionB = new Exception('messageB');
            const expectedResult = [
                false,
                'Expected exception message to be "messageB", was "messageA".',
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false and have details when the data does not match', () => {
            const exceptionA = new Exception('messageA');
            const exceptionB = new Exception(
                'messageB',
                null,
                new Map([['key', ['data']]])
            );
            const expectedResult = [
                false,
                [
                    'Expected exception message to be "messageB", was "messageA".',
                    '- Expected map item count to be 1, but found 0.',
                    "- Expected to find key 'key'.",
                ].join('\n'),
            ];

            const actualResult = exceptionA.equalsWithDetails(exceptionB);

            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('dataEquals', () => {
        test('Should be true when the data is equal', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['message', 'message again']]])
            );
            const inputExceptionData = new Map([
                ['key', ['message', 'message again']],
            ]);
            const expectedResult = true;

            const actualResult = exception.dataEquals(inputExceptionData);

            expect(actualResult).toEqual(expectedResult);
        });

        test('Should be false when the data is not equal', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['message', 'message again']]])
            );
            const inputExceptionData = new Map([['key', ['message']]]);
            const expectedResult = false;

            const actualResult = exception.dataEquals(inputExceptionData);

            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('dataEqualsWithDetails', () => {
        test('Should be true and have no details when there is no data', () => {
            const exception = new Exception();
            const inputExceptionData = new Map();
            const expectedDetails = [true, ''];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be true and have no details when there is data', () => {
            const exception = new Exception(
                '',
                null,
                new Map([
                    ['keyA', ['messageA', 'messageB']],
                    ['keyB', ['messageA']],
                ])
            );
            const inputExceptionData = new Map([
                ['keyA', ['messageA', 'messageB']],
                ['keyB', ['messageA']],
            ]);
            const expectedDetails = [true, ''];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be false and have details when the size is mismatched and is missing data', () => {
            const exception = new Exception();
            const inputExceptionData = new Map([['key', ['message']]]);
            const expectedDetails = [
                false,
                [
                    `- Expected map item count to be ${inputExceptionData.size}, but found ${exception.data.size}.`,
                    "- Expected to find key 'key'.",
                ].join('\n'),
            ];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be false and have details when the exceptions do not share any data', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key2', ['message2']]])
            );
            const inputExceptionData = new Map([['key', ['message']]]);
            const expectedDetails = [
                false,
                [
                    "- Did not expect to find key 'key2'.",
                    "- Expected to find key 'key'.",
                ].join('\n'),
            ];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be false and have details when the exception has additional data', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['message']]])
            );
            const inputExceptionData = new Map();
            const expectedDetails = [
                false,
                [
                    `- Expected map item count to be ${inputExceptionData.size}, but found ${exception.data.size}.`,
                    "- Did not expect to find key 'key'.",
                ].join('\n'),
            ];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be false and have details when the exception has additional data, missing data, and shared data', () => {
            const exception = new Exception(
                '',
                null,
                new Map([
                    ['keyA', ['message']],
                    ['keyB', ['message']],
                ])
            );
            const inputExceptionData = new Map([
                ['keyA', ['message']],
                ['keyC', ['message']],
            ]);
            const expectedDetails = [
                false,
                [
                    "- Did not expect to find key 'keyB'.",
                    "- Expected to find key 'keyC'.",
                ].join('\n'),
            ];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });

        test('Should be false and have details when the exception has shared data with mismatched values', () => {
            const exception = new Exception(
                '',
                null,
                new Map([['key', ['messageA', 'messageB']]])
            );
            const inputExceptionData = new Map([
                ['key', ['messageA', 'messageC']],
            ]);
            const expectedDetails = [
                false,
                [
                    "- Expected to find key 'key' with value(s) ['messageA', 'messageC'], but found value(s) ['messageA', 'messageB'].",
                ].join('\n'),
            ];

            const actualDetails =
                exception.dataEqualsWithDetails(inputExceptionData);

            expect(actualDetails).toEqual(expectedDetails);
        });
    });
});
