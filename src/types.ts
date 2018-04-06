import * as ESTree from "estree";

// reporter function types
type _ResultReporter = (r: RunnerResult) => void;
type _AggregateReporter = (
  rs: RunnerResult[],
  cfg: PerturbConfig,
  m?: PerturbMetadata,
) => void;

type _SetupRun = (m: Mutant) => Promise<any>;
type _Run = (m: Mutant, setupResult?: any) => Promise<RunnerResult>;
type _CleanupRun = (m: Mutant, setupResult?: any) => Promise<void>;

type _NodeMutator = (n: ESTree.Node) => ESTree.Node | ESTree.Node[];
type _NodeFilter = (n: ESTree.Node) => boolean;

export type Skipper = (node: ESTree.Node, path: string[]) => boolean;

export type ComparativeMatcher = (
  sourceFile: string,
  testFile: string,
) => boolean;
export type GenerativeMatcher = (sourceFile: string) => string;

export type MutatorFinder = (n: ESTree.Node) => MutatorPlugin[];

export type PluginLocator<T extends _Plugin> = (name: string) => T;

// plugin interfaces
interface _Plugin {
  name: string;
}

export interface ReporterPlugin extends _Plugin {
  onResult: _ResultReporter;
  onFinish: _AggregateReporter;
}

export interface MutatorPlugin extends _Plugin {
  nodeTypes: string[];
  mutator: _NodeMutator;
  filter?: _NodeFilter;
}

export interface RunnerPlugin extends _Plugin {
  setup: _SetupRun;
  run: _Run;
  cleanup: _CleanupRun;
}

export interface SkipperPlugin extends _Plugin {
  skipper: Skipper;
}

export interface MatcherPlugin extends _Plugin {
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
  testFiles: string[];
  path: string[]; // path to AST node under mutation
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
  tests: string[];
  sourceCode: string;
}

export interface ParsedMatch extends Match {
  ast: ESTree.Node;
  code: string; // TODO rename this. This is rengenerated source code from AST.
  locations: MutantLocation[];
}

export interface MutantLocation {
  mutator: MutatorPlugin;
  path: string[];
  node: ESTree.Node;
}

export interface PerturbMetadata {
  duration: number;
}
