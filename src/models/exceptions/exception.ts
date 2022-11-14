import { Nullable } from '@the-standard/types';
import { ExceptionData } from './exception-data';
import { ExceptionMessageBuilder } from '../message-builders/exception-message-builder';
import { isNil } from '@the-standard/conditions';

export class Exception extends Error {
    public readonly innerException: Nullable<Exception>;
    public readonly data: ExceptionData;

    constructor(
        message: string = '',
        innerException: Nullable<Exception> = null,
        data: Nullable<ExceptionData> = new Map()
    ) {
        super(message);
        this.name = this.constructor.name;
        this.innerException = innerException;
        if (isNil(data)) {
            this.data = new Map();
        } else {
            this.data = data;
        }
    }

    static fromError(error: unknown) {
        if (error instanceof Exception) {
            return error;
        } else if (error instanceof Error) {
            const exception = new Exception(error.message);
            exception.name = error.name;
            exception.stack = error.stack;
            return exception;
        } else if (typeof error === 'symbol') {
            return new Exception(error.toString());
        } else if (typeof error === 'string') {
            return new Exception(error);
        } else {
            return new Exception(String(error));
        }
    }

    upsertDataList(key: string, value: string) {
        if (this.data.has(key)) {
            (this.data.get(key) as string[]).push(value);
        } else {
            this.data.set(key, [value]);
        }
    }

    containsDetails() {
        return this.data.size > 0;
    }

    throwIfContainsErrors() {
        if (this.containsDetails()) {
            throw this;
        }
    }

    addExceptionData(map: ExceptionData) {
        if (map != null) {
            for (const [key, value] of map.entries()) {
                this.addErrorMessages(key, value);
            }
        }
    }

    addErrorMessages(key: string, value: string[]) {
        if (this.data.has(key)) {
            throw new Error(`Exception data already contains the key: ${key}.`);
        }
        this.data.set(key, value);
    }

    equals(other: Exception): boolean {
        const [isEqual] = this.equalsWithDetails(other);
        return isEqual;
    }

    equalsWithDetails(other: Exception): [boolean, string] {
        return this.equalsWithDetailsHelper(other, 0);
    }

    private equalsWithDetailsHelper(
        other: Exception,
        depth: number
    ): [boolean, string] {
        const messageBuilder = new ExceptionMessageBuilder();
        if (this.name !== other.name) {
            messageBuilder.append(
                `Expected exception name to be "${other.name}", was "${this.name}".`
            );
        }
        if (this.message !== other.message) {
            messageBuilder.append(
                `Expected exception message to be "${other.message}", was "${this.message}".`
            );
        }
        const [, details] = this.dataEqualsWithDetails(other.data);
        messageBuilder.append(details);
        const [innerExceptionEqual, innerDetails] =
            this.innerExceptionEqualsWithDetails(other, depth);
        messageBuilder.append(innerDetails);
        return [
            this.name === other.name &&
                this.message === other.message &&
                innerExceptionEqual &&
                this.dataEquals(other.data),
            messageBuilder.toString(),
        ];
    }

    private innerExceptionEqualsWithDetails(
        other: Exception,
        depth: number
    ): [boolean, string] {
        const messageBuilder = new ExceptionMessageBuilder();
        if (isNil(this.innerException) && isNil(other.innerException)) {
            return [true, messageBuilder.toString()];
        }
        if (!isNil(this.innerException) && isNil(other.innerException)) {
            messageBuilder.append(
                `Did not expect an inner exception of type [${this.innerException.name}].`
            );
            return [false, messageBuilder.toString()];
        }
        if (isNil(this.innerException) && !isNil(other.innerException)) {
            messageBuilder.append(
                `Expected an inner exception of type [${other.innerException.name}].`
            );
            return [false, messageBuilder.toString()];
        }
        const thisInnerException = this.innerException as Exception;
        const otherInnerException = other.innerException as Exception;
        const [innerEquality, innerDetails] =
            thisInnerException.equalsWithDetailsHelper(
                otherInnerException,
                depth + 1
            );
        if (!innerEquality) {
            messageBuilder.append(`[${thisInnerException.name}]:`);
            innerDetails
                .split('\n')
                .forEach((detailLine) =>
                    messageBuilder.appendWithDepth(1, detailLine)
                );
        }
        return [innerEquality, messageBuilder.toString()];
    }

    dataEquals(map: ExceptionData): boolean {
        const [isEqual] = this.dataEqualsWithDetails(map);
        return isEqual;
    }

    dataEqualsWithDetails(map: ExceptionData): [boolean, string] {
        const messageBuilder = new ExceptionMessageBuilder();
        let isEqual = true;
        if (this.data.size === 0 && map.size === 0) {
            return [isEqual, messageBuilder.toString()];
        }
        if (this.data.size !== map.size) {
            isEqual = false;
            messageBuilder.append(
                `- Expected map item count to be ${map.size}, but found ${this.data.size}.`
            );
        }
        const [additionalItems, missingItems, sharedItems] =
            this.getDataDifferences(map);
        isEqual = this.evaluateAdditionalKeys(
            isEqual,
            messageBuilder,
            additionalItems
        );
        isEqual = this.evaluateMissingKeys(
            isEqual,
            messageBuilder,
            missingItems
        );
        isEqual = this.evaluateSharedKeys(isEqual, messageBuilder, sharedItems);
        return [isEqual, messageBuilder.toString()];
    }

    private evaluateAdditionalKeys(
        isEqual: boolean,
        messageBuilder: ExceptionMessageBuilder,
        additionalItems: ExceptionData
    ) {
        if (additionalItems.size === 0) {
            return isEqual;
        }
        for (const [key] of additionalItems.entries()) {
            messageBuilder.append(`- Did not expect to find key '${key}'.`);
        }
        return false;
    }

    private evaluateMissingKeys(
        isEqual: boolean,
        messageBuilder: ExceptionMessageBuilder,
        missingItems: ExceptionData
    ) {
        if (missingItems.size === 0) {
            return isEqual;
        }
        for (const [key] of missingItems.entries()) {
            messageBuilder.append(`- Expected to find key '${key}'.`);
        }
        return false;
    }

    private evaluateSharedKeys(
        isEqual: boolean,
        messageBuilder: ExceptionMessageBuilder,
        sharedItems: ExceptionData
    ) {
        if (sharedItems.size === 0) {
            return isEqual;
        }
        for (const [key, value] of sharedItems.entries()) {
            const expectedValues = value.join("', '");
            const actualValues = this.data.get(key)!.join("', '");
            if (expectedValues !== actualValues) {
                messageBuilder.append(
                    `- Expected to find key '${key}' with value(s) ['${expectedValues}'], but found value(s) ['${actualValues}'].`
                );
                return false;
            }
        }
        return isEqual;
    }

    private getDataDifferences(
        map: ExceptionData
    ): [ExceptionData, ExceptionData, ExceptionData] {
        const additionalItems = new Map(this.data);
        const missingItems = new Map(map);
        const sharedItems = new Map(map);

        for (const [key] of map.entries()) {
            additionalItems.delete(key);
        }
        for (const [key] of this.data.entries()) {
            missingItems.delete(key);
        }
        for (const [key] of additionalItems.entries()) {
            sharedItems.delete(key);
        }
        for (const [key] of missingItems.entries()) {
            sharedItems.delete(key);
        }

        return [additionalItems, missingItems, sharedItems];
    }

    toString(): string {
        const messageBuilder = new ExceptionMessageBuilder();
        let currentException: Nullable<Exception> = this;
        while (!isNil(currentException)) {
            messageBuilder.append(
                `${currentException.name}: ${currentException.message}`.trim()
            );
            if (currentException.containsDetails()) {
                const details = currentException.data;
                for (const [key, values] of details.entries()) {
                    messageBuilder.appendWithDepth(1, `"details": {`);
                    messageBuilder.appendWithDepth(2, `"${key}": [`);
                    values.forEach((value) => {
                        messageBuilder.appendWithDepth(3, `"${value}"`);
                    });
                    messageBuilder.appendWithDepth(2, ']');
                    messageBuilder.appendWithDepth(1, '}');
                }
            }
            if (!isNil(currentException.stack)) {
                const stackLines = currentException.stack.split('\n');
                stackLines.shift();
                messageBuilder.append(stackLines.join('\n'));
            }
            currentException = currentException.innerException;
        }
        return messageBuilder.toString();
    }
}
