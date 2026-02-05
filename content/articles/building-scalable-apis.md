---
title: "Building Scalable APIs with Node.js and TypeScript"
description: "Explore best practices for building production-ready RESTful APIs using Node.js, Express, and TypeScript with a focus on type safety and maintainability."
date: 2024-01-20
readingTime: 12
tags: ["Node.js", "TypeScript", "API Design", "Backend Development"]
---

# Building Scalable APIs with Node.js and TypeScript

TypeScript has become the de facto standard for building robust Node.js applications. In this article, we'll explore how to design and implement scalable APIs that are both type-safe and maintainable.

## Project Setup

Start by initializing a new project with TypeScript:

```bash
npm init -y
npm install express
npm install -D typescript @types/node @types/express ts-node
```

Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Defining Types

One of TypeScript's biggest advantages is strong typing. Define your domain models:

```typescript
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

interface CreateUserDTO {
  email: string
  name: string
  password: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

## Controller Pattern

Organize your code using the controller pattern:

```typescript
import { Request, Response } from 'express'
import { UserService } from './services/user-service'

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAll()
      res.json({
        success: true,
        data: users
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      })
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body
      const user = await this.userService.create(userData)
      res.status(201).json({
        success: true,
        data: user
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }
}
```

## Error Handling

Implement centralized error handling:

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    })
  }

  console.error(err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
}
```

## Validation

Use validation middleware for request validation:

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
})

const validate = (schema: z.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.errors
      })
    }
  }
}
```

## Best Practices

1. **Use dependency injection**: Makes testing easier and code more maintainable
2. **Implement proper logging**: Use structured logging with tools like Winston
3. **Add rate limiting**: Protect your API from abuse
4. **Use environment variables**: Never hardcode sensitive configuration
5. **Document your API**: Use tools like Swagger/OpenAPI
6. **Implement health checks**: Essential for monitoring and orchestration
7. **Handle graceful shutdown**: Properly close connections on termination

## Testing

Write comprehensive tests:

```typescript
import { describe, it, expect } from 'vitest'
import { UserService } from './user-service'

describe('UserService', () => {
  it('should create a new user', async () => {
    const userService = new UserService()
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    })

    expect(user.email).toBe('test@example.com')
    expect(user.id).toBeDefined()
  })
})
```

## Conclusion

Building scalable APIs with Node.js and TypeScript requires careful planning and adherence to best practices. By leveraging TypeScript's type system, following proven patterns, and implementing proper error handling and validation, you can create APIs that are both robust and maintainable.

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
