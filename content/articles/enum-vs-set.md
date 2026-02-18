---
title: "Enum vs Set: Choosing the Right Representation for a Domain of Values"
description: "When your domain has a finite set of possible values — permissions, statuses, features — should you reach for an enum, a Set, or both? A practical guide with Kotlin examples."
date: 2026-02-12
readingTime: 8
tags: ["Kotlin", "Domain Modeling", "Software Design", "Type Safety"]
---

# Enum vs Set: Choosing the Right Representation for a Domain of Values

Every developer faces this question sooner or later: you need to represent **a collection of possible values** in your domain. User permissions, feature flags, document statuses, supported formats... The values are known, finite, and meaningful.

Two tools immediately come to mind: **enums** and **sets**. But they solve different problems, and picking the wrong one leads to either fragile code or unnecessary rigidity.

Let's break it down.

## The Problem

Imagine you're building a document management system. A document can have **multiple statuses** during its lifecycle: `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`.

A user can hold **multiple permissions**: `READ`, `WRITE`, `DELETE`, `ADMIN`.

How do you model these?

## Approach 1: Set of Strings — Maximum Flexibility

The simplest approach: just use strings.

```kotlin
data class User(
    val name: String,
    val permissions: Set<String> = emptySet()
)

val admin = User(
    name = "Alice",
    permissions = setOf("READ", "WRITE", "DELETE", "ADMIN")
)
```

This works. It's flexible. You can add new permissions without changing any type. But it comes with **serious drawbacks**:

- **No compile-time safety.** A typo like `"WRTE"` silently passes. You'll only discover it at runtime — maybe in production.
- **No discoverability.** New developers have to grep the codebase to understand what valid values exist.
- **No exhaustive checks.** The compiler can't help you ensure you've handled every case.
- **Serialization drift.** If the frontend sends `"write"` instead of `"WRITE"`, it's a valid `String` but an invalid permission.

String sets are appropriate when values are **truly dynamic** — user-defined tags, free-form labels, external identifiers. But for a **closed domain** of known values, there's a better way.

## Approach 2: Enum — Type Safety for the Universe of Values

An enum defines the **complete universe** of valid values at compile time:

```kotlin
enum class Permission {
    READ, WRITE, DELETE, ADMIN
}
```

Now the compiler is your ally:

```kotlin
fun describePermission(p: Permission): String = when (p) {
    Permission.READ   -> "Can view documents"
    Permission.WRITE  -> "Can create and edit documents"
    Permission.DELETE  -> "Can remove documents"
    Permission.ADMIN  -> "Full system access"
    // Compiler error if you forget a case!
}
```

Enums give you:

- **Compile-time exhaustiveness.** `when` expressions force you to handle every variant (or add an explicit `else`).
- **Discoverability.** Autocomplete shows all valid values. Documentation is built-in.
- **Refactoring safety.** Rename a variant and the compiler shows you every usage.
- **Serialization safety.** Deserialization fails explicitly if an unknown value arrives.

But an enum alone answers a different question. It tells you **what values exist**, not **which ones are active**.

## The Real Answer: Set\<Enum\> — Combining Both

Here's the insight many developers miss: **enum and set are not alternatives. They're complementary.**

- The **enum** defines the closed universe of possible values.
- The **set** holds a particular **subset** that's currently active.

```kotlin
enum class Permission {
    READ, WRITE, DELETE, ADMIN
}

data class User(
    val name: String,
    val permissions: Set<Permission> = emptySet()
)

val editor = User(
    name = "Bob",
    permissions = setOf(Permission.READ, Permission.WRITE)
)
```

Now you get the best of both worlds:

- Type-safe: `setOf(Permission.WRTE)` won't compile
- Discoverable: the enum documents all possible permissions
- Flexible: each user can have a different subset
- Exhaustive: you can still `when` over individual permissions

## EnumSet: The Performance-Optimized Variant

If you're on the JVM (Java/Kotlin), there's an underused gem: `EnumSet`.

```kotlin
import java.util.EnumSet

val editorPermissions: EnumSet<Permission> =
    EnumSet.of(Permission.READ, Permission.WRITE)

val allPermissions: EnumSet<Permission> =
    EnumSet.allOf(Permission::class.java)

val noPermissions: EnumSet<Permission> =
    EnumSet.noneOf(Permission::class.java)
```

Under the hood, `EnumSet` is backed by a **bit vector**. Each enum value maps to a single bit. This means:

- **Constant-time** `contains`, `add`, `remove` operations
- **Minimal memory**: a single `Long` for enums with up to 64 values
- **Blazing fast** set operations (`union`, `intersection`, `complement`)

For comparison, a `HashSet<Permission>` allocates a full hash table with wrapper objects. An `EnumSet` is just a `long` — one machine word.

This is particularly relevant when you check permissions on every request:

```kotlin
fun hasAccess(userPermissions: EnumSet<Permission>, required: Permission): Boolean {
    return required in userPermissions  // Single bitwise AND
}
```

## A Real-World Example: Feature Flags

Let's apply this to a common pattern — feature flags:

```kotlin
enum class Feature {
    DARK_MODE,
    EXPORT_PDF,
    AI_ASSISTANT,
    MULTI_LANGUAGE,
    ADVANCED_SEARCH
}

data class TenantConfig(
    val tenantId: String,
    val enabledFeatures: Set<Feature> = EnumSet.noneOf(Feature::class.java)
)

// Business logic stays clean and type-safe
fun canUseFeature(config: TenantConfig, feature: Feature): Boolean {
    return feature in config.enabledFeatures
}

// Adding a new feature is a one-line enum change
// The compiler tells you everywhere you need to handle it
```

Compare this with the string-based alternative:

```kotlin
// Fragile: no way to know what's valid
data class TenantConfig(
    val tenantId: String,
    val enabledFeatures: Set<String> = emptySet()
)

// Does this tenant have "dark_mode" or "DARK_MODE" or "darkMode"?
fun canUseFeature(config: TenantConfig, feature: String): Boolean {
    return feature in config.enabledFeatures
}
```

The string version looks similar but is fundamentally more fragile.

## Decision Guide

| Criterion | `Set<String>` | `enum` alone | `Set<Enum>` / `EnumSet` |
|---|---|---|---|
| Values known at compile time | No | Yes | Yes |
| Multiple values active at once | Yes | No | **Yes** |
| Type safety | None | Full | **Full** |
| Dynamic / user-defined values | **Yes** | No | No |
| Exhaustive `when` checks | No | **Yes** | **Yes** (on elements) |
| Performance (JVM) | HashMap overhead | N/A | **Bit vector** |

**Use `Set<String>`** when values are genuinely dynamic: user tags, external labels, plugin identifiers.

**Use `enum` alone** when a value can only be **one thing at a time**: a document's current status, a request's HTTP method.

**Use `Set<Enum>` or `EnumSet`** when an entity can have **multiple values from a closed set**: permissions, features, capabilities, flags.

## A Note on Sealed Classes

In Kotlin, if your "values" carry data, consider `sealed class` or `sealed interface` instead of enum:

```kotlin
sealed interface ExportFormat {
    data object PDF : ExportFormat
    data object CSV : ExportFormat
    data class Custom(val mimeType: String, val template: String) : ExportFormat
}

// Still works with Set
val supportedFormats: Set<ExportFormat> = setOf(
    ExportFormat.PDF,
    ExportFormat.Custom("application/xml", "invoice-v2")
)
```

Sealed classes give you the exhaustiveness of enums with the flexibility to carry associated data. The trade-off: you lose `EnumSet` optimization and built-in serialization convenience.

## Conclusion

The "enum vs set" question is often a **false dichotomy**. They solve different problems:

- **Enum** answers: *what are the possible values?*
- **Set** answers: *which values are currently active?*

The most robust pattern for closed domains is to **combine both**: define the universe with an enum, hold the active subset in a set. On the JVM, `EnumSet` makes this essentially free from a performance standpoint.

Reserve `Set<String>` for truly open domains where you can't (or shouldn't) enumerate values at compile time. For everything else, let the type system do the heavy lifting.

## Resources

- [Kotlin Enum Classes](https://kotlinlang.org/docs/enum-classes.html)
- [Kotlin Sealed Classes](https://kotlinlang.org/docs/sealed-classes.html)
- [Java EnumSet documentation](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumSet.html)
- [Effective Java, Item 36: Use EnumSet instead of bit fields](https://www.oreilly.com/library/view/effective-java/9780134686097/) — Joshua Bloch
