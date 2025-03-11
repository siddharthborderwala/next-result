# next-result

A Result type built for Next.js; can be used anywhere.

## Features

- 🪶 **Lightweight** - Tiny implementation with zero dependencies
- 💪 **Type-Safe** - Full TypeScript support with type inference
- 🎯 **Server Action Ready** - Perfect for Next.js Server Actions
- 🔄 **Promise Support** - Built-in utilities for async operations

## Problem

When using server actions, you need to handle errors. You could throw an Error from the server action and have it be handled by the client.

But, Next.js masks the actual error message in production, so we can't do that!

## Solution

This library provides a Result type that can be used to return errors from server actions and have them be handled by the client.

## Installation

```bash
npm install next-result
# or
yarn add next-result
# or
pnpm add next-result
```

## Basic Usage

The Result type provides a type-safe way to handle operations that might fail:

```typescript
import { Result, Ok, Err } from "next-result";

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Err("Cannot divide by zero");
  }
  return Ok(a / b);
}

// Success case
const result1 = divide(10, 2);
if (result1.ok) {
  console.log(result1.value); // 5
}

// Error case
const result2 = divide(10, 0);
if (!result2.ok) {
  console.log(result2.error); // "Cannot divide by zero"
}
```

## Next.js Server Action Example

Perfect for handling server action results with TanStack Query:

```ts
// app/actions.ts
"use server";

import { Ok, Err } from "next-result";

interface User {
  id: string;
  name: string;
}

export async function createUser(name: string) {
  try {
    // Your database operation here
    const user = await db.users.create({ name });
    return Ok({ id: user.id, name: user.name });
  } catch (error) {
    return Err("Failed to create user");
  }
}
```

```tsx
// app/components/create-user.tsx
"use client";

import { unwrapPromise } from "next-result";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../actions";

export function CreateUser() {
  const { mutate, isError, isSuccess, isPending, error, data } = useMutation({
    mutationFn: (name: string) => unwrapPromise(createUser(name)),
    onSuccess: (data) => {
      // do something
      // show a success toast
    },
    onError: (error) => {
      // do something
      // show an error toast
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate("John Doe");
      }}
    >
      {isError ? <div>Error: {error.message}</div> : null}
      {isSuccess ? <div>Created user: {data.name}</div> : null}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating user..." : "Create User"}
      </button>
    </form>
  );
}
```

## API Reference

### Types

#### Result

The main type representing either success or failure.

```typescript
type Result<T> = Ok<T> | Err;
```

#### Ok

Represents a successful result containing a value.

```typescript
type Ok<T> = {
  ok: true;
  value: T;
};
```

#### Err

Represents an error result containing an error message.

```typescript
type Err = {
  ok: false;
  error: string;
};
```

#### Option

Represents an optional value that can be either a value or null.

```typescript
type Option<T> = T | null;
```

#### PromiseResult

A promise that resolves to a Result.

```typescript
type PromiseResult<T> = Promise<Result<T>>;
```

### Constructors

#### Ok

Creates a successful result containing a value.

```typescript
const success = Ok(42);
// { ok: true, value: 42 }
```

#### Err

Creates an error result with an error message.

```typescript
const error = Err("Something went wrong");
// { ok: false, error: "Something went wrong" }
```

### Type Guards

#### isOk

Type guard to check if a result is successful.

```typescript
if (isOk(result)) {
  // result.value is accessible here
}
```

#### isErr

Type guard to check if a result is an error.

```typescript
if (isErr(result)) {
  // result.error is accessible here
}
```

### Value Extractors

#### unwrap

Extracts the value from a successful result or throws the error.

```typescript
const value = unwrap(Ok(42)); // 42
// unwrap(Err("error")); // throws Error("error")
```

#### unwrapOrDefault

Extracts the value or returns a default value.

```typescript
const value = unwrapOrDefault(Ok(42), 0); // 42
const def = unwrapOrDefault(Err("error"), 0); // 0
```

#### optionOk

Extracts the value from a successful result or returns null.

```typescript
const value = optionOk(Ok(42)); // 42
const none = optionOk(Err("error")); // null
```

#### optionErr

Extracts the error message from an error result or returns null.

```typescript
const error = optionErr(Err("error")); // "error"
const none = optionErr(Ok(42)); // null
```

### For Async Operations

#### unwrapPromise

Awaits a promise result and unwraps it.

```typescript
const value = await unwrapPromise(Promise.resolve(Ok(42))); // 42
// throws if the result is an error
```

#### unwrapPromiseOrDefault

Awaits a promise result and unwraps it or returns a default value.

```typescript
async function testOK() {
  // ... some async operations
  return Ok(42);
}

async function testErr() {
  // ... some async operations
  return Err("error");
}

const value = await unwrapPromiseOrDefault(testOK(), 0); // 42
const def = await unwrapPromiseOrDefault(testErr(), 0); // 0
```

## License

MIT
