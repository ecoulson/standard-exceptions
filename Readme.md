### Conditions

This library contains common conditions that are checked in javascript and have been condensed down to simlple helper functions.

The current functions provided by this package are defined below.

-   isNil(x): Checks that the value is either null or undefined

An example usage of this library is provided below.

```typescript
import { isNil } from '@the-standard/conditions';

// ...

function getUser(userId: string) {
    const user = userBroker.getUserById(userId);
    if (isNil(user)) {
        // handle null/undefined case;
    }
    // handle any additional validations
    return user;
}
```

This package supports typescript types and each of the condition checks also provide type guards to simplify typescript code.
