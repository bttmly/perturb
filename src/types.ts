///<reference path="../typings/globals/estree/index.d.ts"/>

// reporter function types
export interface ResultReporter {
  (r: RunnerResult): void;
}

export interface AggregateReporter {
  (rs: Array<RunnerResult>): void;
}

// runner plugin function types
export interface Runner {
  (m: Mutant): Promise<RunnerResult>;
}

export interface PrepareRun {
  (m: Mutant): Promise<any>;
}

export interface CleanupRun {
  (m: Mutant, before?: any): Promise<void>;
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
export interface ComparativeMatcher {
  (sourceFile: string, testFile: string): boolean;
}

export interface GenerativeMatcher {
  (sourceFile: string): string;
}

// plugin interfaces
export interface Plugin {
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

// plugins
export interface MatcherPlugin extends Plugin {
  type: "generative" | "comparative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher | ComparativeMatcher;
}

export interface GenerativeMatcherPlugin extends MatcherPlugin {
  type: "generative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher;
}

export interface ComparativeMatcherPlugin extends MatcherPlugin {
  type: "comparative";
  makeMatcher: (c: PerturbConfig) => ComparativeMatcher;
}

// structural data types

export interface PerturbConfig {
  testCmd: string;
  
  mutators: string[]; // names of mutator plugins to apply
  skippers: string[]; // names of skipper plugins to apply

  reporter: string; // name of reporter plugin
  matcher: string; // name of matcher plugin
  runner: string; // name of runner plugin

  projectRoot: string;
  perturbDir: string;
  sourceDir: string;
  testDir: string;

  sourceGlob: string;
  testGlob: string;
}

export interface Mutant {
  mutatorName: string; // name of mutator plugin
  sourceFile: string;
  testFiles: Array<string>;
  path: Array<string>; // path to AST node under mutation
  astBefore: ESTree.Node;
  astAfter: ESTree.Node;
  loc: ESTree.SourceLocation; // line of code where mutation occurred
  originalSourceCode: string;
  mutatedSourceCode: string;
}

export interface RunnerResult extends Mutant {
  error?: any;
}

export interface Match {
  source: string;
  tests: Array<string>;
}

