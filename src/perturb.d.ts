// reporter function types
type _ResultReporter = (r: RunnerResult) => void;
type _AggregateReporter = (rs: RunnerResult[], m?: PerturbMetadata) => void

type _SetupRun = (m: Mutant) => Promise<any>;
type _Run = (m: Mutant) => Promise<RunnerResult>;
type _CleanupRun = (m: Mutant, before?: any) => Promise<void>;

type _NodeMutator = (n: ESTree.Node) => ESTree.Node | ESTree.Node[];
type _NodeFilter = (n: ESTree.Node) => boolean;

type Skipper = (node: ESTree.Node, path: string[]) => boolean;

type ComparativeMatcher = (sourceFile: string, testFile: string) => boolean;
type GenerativeMatcher = (sourceFile: string) => string;

type MutatorFinder = (n: ESTree.Node) => MutatorPlugin[];

type PluginLocator<T extends _Plugin> = (name: string) => T;

// plugin interfaces
interface _Plugin {
  name: string;
}

interface ReporterPlugin extends _Plugin {
  onResult: _ResultReporter;
  onFinish: _AggregateReporter;
}

interface MutatorPlugin extends _Plugin {
  nodeTypes: string[];
  mutator: _NodeMutator;
  filter?: _NodeFilter;
}

interface RunnerPlugin extends _Plugin {
  setup: _SetupRun;
  run: _Run;
  cleanup: _CleanupRun;
}

interface SkipperPlugin extends _Plugin {
  skipper: Skipper;
}

interface MatcherPlugin extends _Plugin {
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
  sourceCode: string;
}

interface ParsedMatch extends Match {
  ast: ESTree.Node;
  code: string; // TODO rename this. This is rengenerated source code from AST.
  locations: MutantLocation[];
}

interface MutantLocation {
  mutator: MutatorPlugin;
  path: string[];
  node: ESTree.Node;
}

interface PerturbMetadata {
  duration: number;
}
