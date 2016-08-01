// reporter function types
interface ResultReporter {
  (r: RunnerResult): void;
}

interface AggregateReporter {
  (rs: RunnerResult[], m?: PerturbMetadata): void;
}

// runner plugin function types
interface Runner {
  (m: Mutant): Promise<RunnerResult>;
}

interface SetupRun {
  (m: Mutant): Promise<any>;
}

interface CleanupRun {
  (m: Mutant, before?: any): Promise<void>;
}

// mutator plugin function types
interface P_NodeMutator {
  (n: ESTree.Node): ESTree.Node;
}

interface P_NodeFilter {
  (n: ESTree.Node): boolean;
}

// skipper plugin function types
interface Skipper {
  (node: ESTree.Node, path: string[]): boolean;
}

// matcher plugin function types
interface ComparativeMatcher {
  (sourceFile: string, testFile: string): boolean;
}

interface GenerativeMatcher {
  (sourceFile: string): string;
}

// plugin interfaces
interface P_Plugin {
  name: string;
}

interface ReporterPlugin extends P_Plugin {
  onResult: ResultReporter;
  onFinish: AggregateReporter;
}

interface MutatorPlugin extends P_Plugin {
  nodeTypes: string[];
  filter?: P_NodeFilter;
  mutator: P_NodeMutator;
}

interface RunnerPlugin extends P_Plugin {
  setup: (mutant: Mutant) => Promise<any>
  run: (mutant: Mutant) => Promise<RunnerResult>
  cleanup: (mutant: Mutant, before: any) => Promise<void>
}

interface SkipperPlugin extends P_Plugin {
  skipper: Skipper;
}

// plugins
interface MatcherPlugin extends P_Plugin {
  type: "generative" | "comparative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher | ComparativeMatcher;
}

interface GenerativeMatcherPlugin extends MatcherPlugin {
  type: "generative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher;
}

interface ComparativeMatcherPlugin extends MatcherPlugin {
  type: "comparative";
  makeMatcher: (c: PerturbConfig) => ComparativeMatcher;
}

// structural data types

interface PerturbConfig {
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

interface PerturbMetadata {
  duration: number;
}

interface Mutant {
  mutatorName: string; // name of mutator plugin
  sourceFile: string;
  testFiles: string[];
  path: string[]; // path to AST node under mutation
  astBefore: ESTree.Node;
  astAfter: ESTree.Node;
  loc: ESTree.SourceLocation; // line of code where mutation occurred
  originalSourceCode: string;
  mutatedSourceCode: string;
}

interface RunnerResult extends Mutant {
  error?: any;
}

interface Match {
  source: string;
  tests: string[];
}

