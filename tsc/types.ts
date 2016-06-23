// reporter function types
export interface ResultReporter {
  (r: MutationResult): void;
}

export interface AggregateReporter {
  (rs: Array<MutationResult>): void;
}

// runner plugin function types
export interface Runner {
  (m: MutationDescriptor): Promise<MutationResult>;
}

export interface PrepareRun {
  (m: MutationDescriptor): Promise<any>;
}

export interface CleanupRun {
  (m: MutationDescriptor, before?: any): Promise<void>;
}

// mutator plugin function types
export interface NodeMutator {
  (n: ESTree.Node): ESTree.Node;
}

export interface NodeFilter {
  (n: ESTree.Node): boolean;
}

// skipper plugin function types
export interface Skipper {
  (n: ESTree.Node, p?: Array<string>): boolean;
}

// matcher plugin function types
interface ComparativeMatcher {
  (sourceFile: string, testFile: string): boolean;
}

interface GenerativeMatcher {
  (sourceFile: string): string;
}

// plugin interfaces
interface Plugin {
  name: string;
}

export interface ReporterPlugin extends Plugin {
  onResult: ResultReporter;
  onFinish: AggregateReporter;
}

export interface MutatorPlugin extends Plugin {
  nodeTypes: Array<string>;
  filter?: NodeFilter;
  mutator: NodeMutator;
}

export interface RunnerPlugin extends Plugin {
  prepare: PrepareRun;
  run: Runner;
  cleanup: CleanupRun;
}

export interface SkipperPlugin extends Plugin {
  skipper: Skipper;
}

export interface MatcherPlugin extends Plugin {
  type: "generative" | "comparative";
}

export interface GenerativeMatcherPlugin extends MatcherPlugin {
  type: "generative";
  matcher: GenerativeMatcher;
}

export interface ComparativeMatcherPlugin extends MatcherPlugin {
  type: "comparative";
  matcher: ComparativeMatcher;
}

// structural data types

export interface PerturbConfig {
  originalSourceDir: string;
  originalTestDir: string;
  perturbRoot: string;
  perturbSourceDir: string;
  perturbTestDir: string;
  runner: string;
  reporter: string;
}

export interface Mutant {
  mutator: string; // name of mutator
  source: string;
  tests: Array<string>;
  name: string; // name of mutation operation
  path: Array<string>; // path to AST node under mutation
  loc: number; // line of code where mutation occurred
  ast: Object; // the AST after mutation
  sourceCode: string; // source code before mutation
  mutatedSourceCode: string; // source code after mutation
}

export interface MutationResult extends MutationDescriptor {
  error?: any;
}

export interface Match {
  source: string;
  tests: Array<string>;
}

