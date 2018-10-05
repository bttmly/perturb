import * as ESTree from "estree";

// reporter function types
export type ResultReporter = (r: RunnerResult) => void;

export type AggregateReporter = (
  rs: RunnerResult[],
  cfg: PerturbConfig,
  m?: PerturbMetadata,
) => void;

export type NodeMutator = (n: ESTree.Node) => ESTree.Node | ESTree.Node[];
export type NodeFilter = (n: ESTree.Node) => boolean;

export type Skipper = (node: ESTree.Node, path: string[]) => boolean;

export type ComparativeMatcher = (
  sourceFile: string,
  testFile: string,
) => boolean;
export type GenerativeMatcher = (sourceFile: string) => string;

export type MutatorFinder = (n: ESTree.Node) => MutatorPlugin[];

export type PluginLocator<T extends BasePlugin> = (name: string) => T;

export type PluginType = "reporter" | "runner" | "matcher" | "mutator";

// plugin interfaces
export interface BasePlugin {
  name: string;
  type: PluginType;
}

export interface ReporterPlugin extends BasePlugin {
  onResult: ResultReporter;
  onFinish: AggregateReporter;
}

export interface MutatorPlugin extends BasePlugin {
  nodeTypes: string[];
  mutator: NodeMutator;
  filter?: NodeFilter;
}

export interface RunnerPluginConstructor {
  new(m: Mutant): RunnerPlugin;
}

export interface RunnerPlugin extends BasePlugin {
  setup(): Promise<void>;
  run(): Promise<RunnerResult>;
  cleanup(): Promise<void>;
}

export interface SkipperPlugin extends BasePlugin {
  skipper: Skipper;
}

export interface MatcherPlugin extends BasePlugin {
  matchType: "generative" | "comparative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher | ComparativeMatcher;
}

export interface GenerativeMatcherPlugin extends MatcherPlugin {
  matchType: "generative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher;
}

export interface ComparativeMatcherPlugin extends MatcherPlugin {
  matchType: "comparative";
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

export type OptionalPerturbConfig = Partial<PerturbConfig>;

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
