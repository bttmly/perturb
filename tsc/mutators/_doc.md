# Mutators

Mutator interface

```typescript

// internal description of a mutation to execute
interface MutationDescriptor {
  
}

// internal description of result of mutation execution
interface ResultDescriptor {
  
}

enum NodeType {
  
}

// Runner plugins adhere to this interface
// A runner object should be written such that it can handle *many* mutation descriptors
// (i.e. it should not hold internal state specific to a single mutation)
// The harness that executes it's methods ensures the result of `before()` is passed into 
interface Runner {
  name: String,
  before: (mut: MutationDescriptor): Promise<T>
  run: (mut: MutationDescriptor): Promise<ResultDescriptor>
  after: (mut: MutationDescriptor, beforeResult: T): Promise<{}>
}

// Mutator plugins adhere to this interface
// A mutators `filter` method is optional. The `mutator` method must be a pure function of 
// ImmutableNode -> ImmutableNode
interface Mutator {
  name: String,
  nodeTypes: []NodeType,
  filter?: (node: Node): Boolean
  mutator: (node: Node): Node
}

// Reporter plugins adhere to this interface
// A reporter object should be written such that it can handle *many* ResultDescriptor objects
interface Reporter {
  name: String,
  before (): void
  onResult (result: ResultDescriptor): void
  after (results: []ResultDescriptor): void
}

```